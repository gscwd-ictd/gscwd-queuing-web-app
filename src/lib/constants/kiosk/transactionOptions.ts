// ? These hardcoded options for transaction is used in kiosk instead of transaction coming from transaction API

import { FileUser, HandCoins, Heart, LucideIcon } from "lucide-react";

type TransactionOptions = {
  id: string;
  name: string;
  code: string;
  translation: string;
  icon: LucideIcon;
};

export const transactionOptions: TransactionOptions[] = [
  {
    id: "0843097b-688d-481e-823f-aab0b086925a",
    name: "Payment",
    translation: "Mobayad sa bill sa tubig",
    icon: HandCoins,
    code: "P",
  },
  {
    id: "cc3dc11d-bd7b-45fc-9dd8-d8e8894851ec",
    name: "New Service Application",
    translation: "Bag-ong Aplikante",
    icon: FileUser,
    code: "A",
  },
  {
    id: "2e2dc2cb-df8e-4217-a2c1-1ca5c5571e5c",
    name: "Customer Welfare",
    translation: "Kaayohan sa Kustomer",
    icon: Heart,
    code: "CW",
  },
];
