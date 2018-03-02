var appRoot = require('app-root-path');

var settings = {
    site_version: "1.0.0",
    site_name: 'Wefuny Shop',
    site_title: 'Wefuny Shopping',
    site_description: 'wefuny shopping, may tinh, linh kien may tinh, may tinh xach tay',
    default_template: 'base',
    secured_key: 'j3Xj2Ibhdj3g1JFwYy5vRw5uLj5SEbH0',
    RECAPTCHA_PUBLIC_KEY: '6LcDtRoUAAAAAA4c5BRWzILCt2UQt86UJ18FCpTl',
    RECAPTCHA_PRIVATE_KEY: '6LcDtRoUAAAAANMZcHVATEZqXka-jTr6Co-MHKtF',
    site_email: 'info@wefuny.com',
    company_name: 'TRUNG TÂM MÁY TÍNH PHƯƠNG ANH',
    site_telephone: '0963098800',
    site_address: 'Hợp Giao, Xuân Giao, Bảo Thắng, Lào Cai',
    confirmEmail: 0,
    mailOptions: //SendGrid, Gmail, GodaddyAsia, Hotmail
    {
        // Enable pop3 account
        // https://accounts.google.com/b/0/DisplayUnlockCaptcha
        // https://myaccount.google.com/lesssecureapps
        // host: 'smtp.gmail.com',
        // port: 465,
        // secure: true, // use SSL
        // auth: {
        //     user: 'nodereply@gmail.com',
        //     pass: 'Abc123456@'
        // }
        host: 'sg2plcpnl0022.prod.sin2.secureserver.net',
        port: 465,
        requireTLS: true,
        secure: true, // use SSL
        auth: {
            user: 'noreply@wefuny.com',
            pass: '123456@'
        }
    },
    passwordLenght: 6,
    best_sales_limit: 10,
    urlExt: 'html', //.html
    adminLoginTemplate: 'layout_login1', // layout_login1, layout_login2
    InsertAdmin: false,
    maxFilesUpload: 5,
    allowUploadProductExt: 'jpg|gif|png',
    maxSizeUpload: 5 * 1024 * 1024, // 1MB
    adminListPerPage: 10,
    uploadPath: appRoot + '/uploads',
    productImgSize: [{
            size: 'large',
            width: 500,
            height: 500,
            quality: 100
        },
        {
            size: 'medium',
            width: 400,
            height: 400,
            quality: 100
        },
        {
            size: 'small',
            width: 66,
            height: 66,
            quality: 100
        }
    ],
    // Cart
    currency_code: 'đ',
    flat_shipping: 30000,
    free_shipping_amount: 10000000,
    vat_applied: false,
    vat: 5


}

module.exports = settings;