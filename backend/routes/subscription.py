import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from ..db import get_db
from ..auth import get_current_user
from .. import models
from ..schemas import SubscribeOut
router = APIRouter(prefix="/subscription", tags=["subscription"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
STRIPE_PRICE_ID = os.getenv("STRIPE_PRICE_ID")  # your monthly price ID from Stripe dashboard
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

@router.post("/checkout", response_model=SubscribeOut)
def create_checkout_session(
    current_user: models.User = Depends(get_current_user),
):
    """Create a Stripe Checkout session and return the URL."""
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{"price": STRIPE_PRICE_ID, "quantity": 1}],
            customer_email=current_user.email,
            metadata={"user_id": str(current_user.id)},
            success_url=f"{FRONTEND_URL}/premium/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/premium/cancel",
        )
        return SubscribeOut(checkout_url=session.url)
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Stripe sends POST events here after payment.
    Set your webhook URL in the Stripe dashboard → Developers → Webhooks.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        raise HTTPException(status_code=400, detail=str(e))

    if event["type"] == "checkout.session.completed":
        session_obj = event["data"]["object"]
        user_id = session_obj.get("metadata", {}).get("user_id")

        if user_id:
            user = db.query(models.User).filter(models.User.id == int(user_id)).first()
            if user:
                user.is_premium = True
                user.premium_expires = datetime.utcnow() + timedelta(days=30)
                db.commit()

    elif event["type"] == "customer.subscription.deleted":
        customer_email = event["data"]["object"].get("customer_email")
        if customer_email:
            user = db.query(models.User).filter(models.User.email == customer_email).first()
            if user:
                user.is_premium = False
                db.commit()

    return {"received": True}