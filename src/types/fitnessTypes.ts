
// Add these missing types at the end of the file
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Add this if not already present in your types file
export type RechartsValueType = number | string | Array<string | number>;
export type RechartsNameType = string | number;
