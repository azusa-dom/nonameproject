export class DataMaskingService {
  maskSensitive(text) {
    if (!text) return text;
    return String(text).replace(/\b\w{2,}@(\w+\.)+\w+\b/g, '***@***');
  }
}


