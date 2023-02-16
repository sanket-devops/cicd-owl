import { ICore } from "./Icore";

export interface Iuser extends ICore {
  userName: string;
  userPass: string;
  isAdmin: boolean;
  role: string;
}
