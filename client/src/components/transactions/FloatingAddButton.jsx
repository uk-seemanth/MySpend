import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import Modal from "@/components/ui/Modal";
import TransactionForm from "./TransactionForm";

export default function FloatingAddButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(true)}
        aria-label="Add transaction"
        className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-2xl bg-olive text-olive-on shadow-lift lg:bottom-8 lg:right-8"
      >
        <Plus className="h-6 w-6" />
      </motion.button>
      <Modal open={open} onClose={() => setOpen(false)} title="New transaction">
        <TransactionForm onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
