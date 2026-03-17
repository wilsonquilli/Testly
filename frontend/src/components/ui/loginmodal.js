"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

export default function LoginModal({ open, setOpen }) {

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogContent>

        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
        </DialogHeader>

        <input
          placeholder="Email"
          className="border p-2 w-full mb-3"
        />

        <input
          placeholder="Password"
          type="password"
          className="border p-2 w-full mb-3"
        />

        <button className="bg-black text-white w-full p-2 rounded">
          Login
        </button>

      </DialogContent>

    </Dialog>
  );
}