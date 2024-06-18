const fs = require("fs");
const PDFDocument = require("pdfkit");

function generateInvoicePdf(invoice, path) {
    let doc = new PDFDocument({ size: "A4", margin: 50 });

    generateHeader(doc);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    // generateFooter(doc);

    doc.end();
    doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc) {
    doc
        .image("uploads/logo.png", 50, 45, { width: 50 })
        .fillColor("#444444")
        .fontSize(20)
        .text("Go To Spares", 110, 57)
        .fontSize(10)
        .text("Kolkata 700001", 200, 65, { align: "right" })
        .text("India", 200, 80, { align: "right" })
        .moveDown();
}

function generateCustomerInformation(doc, invoice) {
    doc
        .fillColor("#444444")
        .fontSize(20)
        .text("Invoice", 50, 160);

    generateHr(doc, 185);

    const customerInformationTop = 200;

    doc
        .fontSize(10)
        .text("Invoice no:", 50, customerInformationTop)
        .font("Helvetica-Bold")
        .text(invoice.orderNo, 150, customerInformationTop)
        .font("Helvetica")
        .text("Invoice Date:", 50, customerInformationTop + 15)
        .text(formatDate(new Date()), 150, customerInformationTop + 15)
        .text("Invoice Amount:", 50, customerInformationTop + 30)
        .text(
            formatCurrency(invoice.orderPrice),
            150,
            customerInformationTop + 30
        )

        .font("Helvetica-Bold")
        .text(invoice.supplierData.name, 300, customerInformationTop)
        .font("Helvetica")
        .text(invoice.supplierData.address, 300, customerInformationTop + 15)
        .text(
            invoice.supplierData.city +
            ", " +
            invoice.supplierData.country +
            ", " +
            invoice.supplierData.pincode,
            300,
            customerInformationTop + 30
        )
        .moveDown();

    generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
    let i;
    const invoiceTableTop = 330;
    // const { client } = invoice;
    // const { pricePerSession } = client;

    doc.font("Helvetica-Bold");
    generateTableRow(
        doc,
        invoiceTableTop,
        "Item",
        "MRP",
        "After Discount",
        "Quantity",
        "Total"
    );
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");

    for (i = 0; i < invoice.orderDetailsArray.length; i++) {
        const item = invoice.orderDetailsArray[i];
        const position = invoiceTableTop + (i + 1) * 30;
        generateTableRow(
            doc,
            position,
            item.proTitle,
            formatCurrency(item.main_price),
            formatCurrency(item.price),
            item.quantity,
            formatCurrency(item.totalPrice)
        );

        generateHr(doc, position + 20);
    }

    const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
        doc.font("Helvetica-Bold"),
        subtotalPosition,
        "",
        "",
        "Subtotal",
        "",
        formatCurrency(invoice.orderPrice)
    );

    // const paidToDatePosition = subtotalPosition + 20;
    // generateTableRow(
    //     doc,
    //     paidToDatePosition,
    //     "",
    //     "",
    //     "Paid To Date",
    //     "",
    //     formatCurrency(invoice.paid)
    // );

    // const duePosition = paidToDatePosition + 25;
    // doc.font("Helvetica-Bold");
    // generateTableRow(
    //     doc,
    //     duePosition,
    //     "",
    //     "",
    //     "Balance Due",
    //     "",
    //     formatCurrency(invoice.orderPrice - invoice.paid)
    // );
    // doc.font("Helvetica");
}

// function generateFooter(doc) {
//     doc

//         .image("signature_sample.png", 300, 500, { width: 50, align: "center" })
//         .fontSize(10)
//         .text(
//             "Payment is due within 15 days. Thank you. How to pay ? Options below.",
//             50,
//             600,
//             { align: "center" }
//         )
//         .text(
//             "Paypal -> paypal.me/test1234",
//             50,
//             620,
//             { align: "center", link: 'https://www.paypal.com/paypalme/test1234', underline: true }
//         )
//         .text(
//             "Lydia -> 06 66 97 06 70",
//             50,
//             640,
//             { align: "center" }
//         )
//         .text(
//             "RIB -> me contact me",
//             50,
//             660,
//             { align: "center" }
//         )
//         .text(
//             "By kofi https://ko-fi.com/dev_it_out ( click here ) then click on Donate and enter the amount + send me a screenshot",
//             50,
//             680,
//             { align: "center", link: 'https://ko-fi.com/dev_it_out', underline: true }
//         );


// }

function generateTableRow(
    doc,
    y,
    item,
    mainCost,
    finalCost,
    quantity,
    total
) {
    doc
        .fontSize(10)
        .text(item, 50, y, { width: 120 })
        .text(mainCost, 180, y, { width: 90, align: "right" })
        .text(finalCost, 250, y, { width: 110, align: "right" })
        .text(quantity, 370, y, { width: 90, align: "right" })
        .text(total, 0, y, { align: "right" });
}

function generateHr(doc, y) {
    doc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}

function formatCurrency(val) {
    return `Rs. ${val}`;
}

function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return day + " / " + month + " / " + year;
    // return date.toLocaleDateString()
}

module.exports = {
    generateInvoicePdf
};
