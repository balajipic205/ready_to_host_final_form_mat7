export type Coordinator = { name: string; phone: string; role?: string };

export const COORDINATORS: Coordinator[] = [
  { name: "Roshan M", phone: "98410 92274" },
  { name: "Adarsh S", phone: "73059 70106" },
  { name: "Yaaminy S K", phone: "63809 89594" },
  { name: "Roobuck Rao C", phone: "81482 04922" },
  { name: "Mohammed Raeef", phone: "91501 58647" },
  { name: "Harinee V T", phone: "73581 20955" },
  { name: "Lakshanaa A M", phone: "9940337194" },
  { name: "Harini C", phone: "8610163433" },
  { name: "Bawadharani Sree R", phone: "9080251947", role: "Treasurer" },
  { name: "Balaji S", phone: "8122586514" },
  { name: "Surya K", phone: "8754425137", role: "Treasurer" },
];

// Backwards-compatible alias used by older imports.
export const POC_CONTACTS = COORDINATORS;

export const PAYMENT_POCS = COORDINATORS.filter((c) => c.role === "Treasurer");

export const PRICE_PER_MEMBER = 350;
