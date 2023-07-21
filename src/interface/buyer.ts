import Address from "./address";

export default interface Buyer {
  firstName: string;
  lastName: string;
  email: string;
  address: Address;
  createdAt: Date;
}
