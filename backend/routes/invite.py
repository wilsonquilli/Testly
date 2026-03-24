import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import get_current_user
from .. import models
from ..schemas import InviteOut, RedeemIn

router = APIRouter(prefix="/invite", tags=["invites"])

MAX_INVITES_PER_USER = 5

@router.post("/create", response_model=InviteOut)
def create_invite(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.invites_sent >= MAX_INVITES_PER_USER:
        raise HTTPException(status_code=403, detail="Invite limit reached.")

    code = str(uuid.uuid4())
    invite = models.Invite(inviter_id=current_user.id, invite_code=code)
    db.add(invite)

    current_user.invites_sent += 1
    db.commit()

    return InviteOut(invite_code=code)

@router.post("/redeem")
def redeem_invite(
    body: RedeemIn,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    invite = (
        db.query(models.Invite)
        .filter(models.Invite.invite_code == body.code)
        .first()
    )

    if not invite:
        raise HTTPException(status_code=404, detail="Invite code not found.")

    if invite.used_by is not None:
        raise HTTPException(status_code=400, detail="This invite code has already been used.")

    if invite.inviter_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot redeem your own invite code.")

    invite.used_by = current_user.id

    now = datetime.utcnow()
    if current_user.is_premium and current_user.premium_expires and current_user.premium_expires > now:
        current_user.premium_expires += timedelta(days=1)
    else:
        current_user.is_premium = True
        current_user.premium_expires = now + timedelta(days=1)

    db.commit()

    return {"message": "1 day of premium unlocked!", "expires": current_user.premium_expires}