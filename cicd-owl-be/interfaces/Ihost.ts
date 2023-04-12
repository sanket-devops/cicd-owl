import { ICore } from "./Icore";

export interface Ihost extends ICore {
  hostName: string;
  hostAdd: string;
  hostUser: string;
  hostPass: string;
  hostWorkDir: string;
}
