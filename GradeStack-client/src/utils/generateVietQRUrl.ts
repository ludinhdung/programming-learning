interface BankInfo {
    bankName: string;
    accountNumber: string;
    accountName: string;
}

interface VietQRParams {
    amount: number;
    bankInfo: BankInfo;
    addInfo?: string;
}

interface Bank {
    id: number;
    name: string;
    code: string;
    bin: string;
    shortName: string;
    logo: string;
    transferSupported: number;
    lookupSupported: number;
    short_name: string;
    support: number;
    isTransfer: number;
    swift_code: string | null;
}

interface BankListResponse {
    code: string;
    desc: string;
    data: Bank[];
}

const BANK_CODES: { [key: string]: string } = {
    'VCB': '970436', // Vietcombank
    'TCB': '970407', // Techcombank
    'MB': '970422',  // MB Bank
    'VPB': '970432', // VPBank
    'ACB': '970416', // ACB
    'STB': '970403', // Sacombank
    'BIDV': '970418', // BIDV
    'AGB': '970405', // Agribank
    'CTG': '970415', // VietinBank
    'SHB': '970443', // SHB
    'TPB': '970423', // TPBank
    'MSB': '970426', // MSB
    'VIB': '970441', // VIB
    'OCB': '970448', // OCB
    'SCB': '970429', // SCB
    'HDB': '970437', // HDBank
    'EIB': '970431', // Eximbank
    'PVB': '970412', // PVcomBank
    'SEA': '970440', // SeABank
    'BAB': '970409', // BacABank
    'NAB': '970428', // NamABank
    'VAB': '970427', // VietABank
    'GPB': '970408', // GPBank
    'LPB': '970449', // LienVietPostBank
    'KLB': '970452', // KienLongBank
    'BVB': '970454', // BaoVietBank
    'NCB': '970419', // NCB
    'OJB': '970414', // OceanBank
    'PGB': '970430', // PGBank
    'DAB': '970406', // DongABank
    'ABB': '970425', // ABBank
    'SGB': '970400', // SaigonBank
    'IVB': '970434', // IndovinaBank
    'PBV': '970439', // PublicBank
    'CIMB': '970458', // CIMB
    'UOB': '970457', // UOB
    'WRB': '970457', // WooriBank
    'HSBC': '970442', // HSBC
    'HLB': '970442', // HongLeongBank
    'ANZ': '970416', // ANZ
    'CITI': '970433', // Citibank
};

export function generateVietQRUrl({ amount, bankInfo, addInfo = '' }: VietQRParams): string {
    const bankCode = BANK_CODES[bankInfo.bankName];
    if (!bankCode) {
        throw new Error(`Bank code not found for ${bankInfo.bankName}`);
    }

    const account = `${bankCode}-${bankInfo.accountNumber}`;
    const encodedName = encodeURIComponent(bankInfo.accountName);
    const encodedAddInfo = encodeURIComponent(addInfo);

    return `https://api.vietqr.io/image/${account}-${encodedName}.jpg?amount=${amount}&accountName=${encodedName}&addInfo=${encodedAddInfo}`;
}

// Example usage:
const bankInfo: BankInfo = {
    bankName: 'VCB',
    accountNumber: '0311000746048',
    accountName: 'Tran Dinh Khanh Toan'
};

// Generate QR code for 100,000 VND
const qrUrl = generateVietQRUrl({
    amount: 100000,
    bankInfo,
    addInfo: 'Payment for course'
}); 