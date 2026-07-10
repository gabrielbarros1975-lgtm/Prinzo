/**
 * Helper to generate Pix EMV BRCode payload (Copia e Cola)
 * According to BACEN (Banco Central do Brasil) specifications.
 */
export function generatePixPayload({ key, name, city, amount, txid = '***' }) {
  // Validação básica
  if (!key || typeof key !== 'string' || !key.trim()) {
    throw new Error('Chave Pix inválida ou vazia');
  }
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new Error('Nome do titular inválido ou vazio');
  }

  // Formata chave de celular para o padrão Pix
  const formatPixKey = (keyInput) => {
    const cleaned = keyInput.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    // Se for um número brasileiro (11 dígitos), formata como +55 DDD NÚMERO
    if (cleaned.length === 11) {
      return `+55${cleaned}`;
    } else if (cleaned.length === 10) {
      return `+55${cleaned}`;
    }
    // Caso contrário, retorna como está (pode ser email, CPF, ou chave aleatória)
    return keyInput.trim();
  };

  const formatField = (id, val) => {
    const cleanVal = String(val).trim();
    const len = cleanVal.length.toString().padStart(2, '0');
    return `${id}${len}${cleanVal}`;
  };

  // Remove accents and special characters (standard for Pix EMV)
  const sanitizeString = (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-zA-Z0-9\s]/g, '')  // Remove non-alphanumeric except spaces
      .toUpperCase()
      .trim();
  };

  const cleanKey = formatPixKey(key);
  const cleanName = sanitizeString(name).substring(0, 25) || 'PAGAMENTO';
  const cleanCity = sanitizeString(city).substring(0, 15) || 'BRASIL';
  const cleanTxid = sanitizeString(txid).substring(0, 25) || '***';

  // Merchant Account Info (sub-campos: GUI + key)
  const gui = formatField('00', 'br.gov.bcb.pix');
  const keyField = formatField('01', cleanKey);
  const merchantAccountInfoContent = `${gui}${keyField}`;
  const merchantAccountInfo = formatField('26', merchantAccountInfoContent);

  const payloadParts = [
    formatField('00', '01'), // Payload Indicator
    formatField('01', '12'), // Point of Initiation Method (12 = recurrent/multiple times QR)
    merchantAccountInfo,
    formatField('52', '0000'), // Merchant Category Code
    formatField('53', '986'), // BRL Currency
  ];

  if (amount > 0) {
    const formattedAmount = Number(amount).toFixed(2);
    payloadParts.push(formatField('54', formattedAmount));
  }

  payloadParts.push(formatField('58', 'BR')); // Country Code
  payloadParts.push(formatField('59', cleanName)); // Merchant Name
  payloadParts.push(formatField('60', cleanCity)); // Merchant City

  // Additional Data (TxID)
  const txidField = formatField('05', cleanTxid);
  payloadParts.push(formatField('62', txidField));

  // Add CRC16 placeholder (63 + 04 + checksum value)
  const partialPayload = payloadParts.join('') + '6304';

  // CRC16 CCITT (polynomial 0x1021, init 0xFFFF)
  let crc = 0xFFFF;
  for (let i = 0; i < partialPayload.length; i++) {
    const charCode = partialPayload.charCodeAt(i);
    crc ^= (charCode << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');
  return `${partialPayload}${crcHex}`;
}
