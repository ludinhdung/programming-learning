const BANK_CODES: { [key: string]: string } = {
    'Vietcombank': '970436',
    'VietinBank': '970415',
    'BIDV': '970418',
    'Agribank': '970405',

    'Techcombank': '970407',
    'MBBank': '970422',
    'VPBank': '970432',
    'ACB': '970416',
    'TPBank': '970423',
    'Sacombank': '970403',
    'HDBank': '970437',
    'OCB': '970448',
    'VietCapitalBank': '970454',
    'SCB': '970429',
    'VIB': '970441',
    'SHB': '970443',
    'Eximbank': '970431',
    'MSB': '970426',

    'CAKE': '546034',
    'Ubank': '546035',
    'Timo': '963388',

    'SaigonBank': '970400',
    'BacABank': '970409',
    'PVcomBank': '970412',
    'Oceanbank': '970414',
    'NCB': '970419',
    'ShinhanBank': '970424',
    'ABBANK': '970425',
    'VietABank': '970427',
    'NamABank': '970428',
    'PGBank': '970430',
    'VietBank': '970433',
    'BaoVietBank': '970438',
    'SeABank': '970440',
    'COOPBANK': '970446',
    'LPBank': '970449',
    'KienLongBank': '970452',
    'KBank': '668888',

    'CIMB': '422589',
    'Woori': '970457',

    'ViettelMoney': '971005',
    'VNPTMoney': '971011',
};

export function generateVietQRUrl(bank: string, accountNumber: string, accountHolder: string, description: string, amount: Number): string {
    const bankCode = BANK_CODES[bank];

    if (!bankCode) {
        throw new Error(`Bank code not found for ${bank}`);
    }

    return `https://api.vietqr.io/image/${bankCode}-${accountNumber}-N9cMcr0.jpg?amount=${amount}&accountName=${accountHolder}&addInfo=${description}`;
} 