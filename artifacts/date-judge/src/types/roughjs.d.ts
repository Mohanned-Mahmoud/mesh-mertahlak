declare module "roughjs" {
  const rough: any;
  export default rough;
}

declare module "roughjs/bin/core" {
  export interface Options {
    [key: string]: any;
  }
}
