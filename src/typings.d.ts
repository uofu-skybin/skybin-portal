/* SystemJS module definition */
declare var module: NodeModule;
// Add an adhoc typing definition for the TS compiler.
declare var electron: any;
interface NodeModule {
  id: string;
}
