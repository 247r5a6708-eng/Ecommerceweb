import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, UserProfileData, Product } from '../types';

export const generateInvoicePDF = (order: Order, userProfile: UserProfileData) => {
  const doc = new jsPDF();
  
  // Set elegant font
  doc.setFont("helvetica");

  // Top banner
  doc.setFillColor(59, 130, 246); // Brand blue
  doc.rect(0, 0, 210, 40, 'F');
  
  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("LUMINA", 14, 25);
  
  doc.setFontSize(24);
  doc.setFont("helvetica", "normal");
  doc.text("INVOICE", 140, 25);
  
  // Reset text color
  doc.setTextColor(50, 50, 50);
  
  // Company Info
  doc.setFontSize(10);
  doc.text("Lumina Technologies Inc.", 14, 50);
  doc.text("123 Tech Avenue, Silicon Valley, CA 94025", 14, 55);
  doc.text("Email: support@lumina.com", 14, 60);
  doc.text("Web: www.lumina.com", 14, 65);
  
  // Invoice Details
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Details:", 140, 50);
  doc.setFont("helvetica", "normal");
  doc.text(`Order ID: #${order.id}`, 140, 55);
  doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 140, 60);
  doc.text(`Status: ${order.status.toUpperCase()}`, 140, 65);
  
  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 75, 196, 75);
  
  // Customer Details
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Billed To:", 14, 85);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(userProfile.name || "Valued Customer", 14, 92);
  if (userProfile.email) doc.text(userProfile.email, 14, 97);
  if (userProfile.phone) doc.text(userProfile.phone, 14, 102);
  
  const deliveryAddress = order.address 
    ? `${order.address.addressLine1}${order.address.addressLine2 ? ', ' + order.address.addressLine2 : ''}\n${order.address.city}, ${order.address.state} ${order.address.zipCode}\n${order.address.country}`
    : userProfile.address 
      ? userProfile.address
      : "Address not provided";
      
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Delivery Address:", 140, 85);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const splitAddress = doc.splitTextToSize(deliveryAddress, 60);
  doc.text(splitAddress, 140, 92);
  
  const expectedDel = order.expectedDelivery 
    ? new Date(order.expectedDelivery).toLocaleDateString() 
    : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString();
  
  doc.setFont("helvetica", "italic");
  doc.setTextColor(59, 130, 246);
  doc.text(`Expected Delivery: ${expectedDel}`, 140, 115);

  // Table Data
  const tableData = order.items.map(item => {
    const warranty = item.warrantyInfo || "12 Months Warranty";
    return [
      item.name,
      warranty,
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${(item.price * item.quantity).toFixed(2)}`
    ];
  });
  
  autoTable(doc, {
    startY: 125,
    head: [['Product Description', 'Warranty', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    foot: [['', '', '', 'Total:', `$${order.total.toFixed(2)}`]],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: 50 },
    footStyles: { fillColor: [240, 240, 245], textColor: [20, 20, 20], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 40 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(245, 245, 245);
  doc.rect(0, pageHeight - 20, 210, 20, 'F');
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for your business. For any questions concerning this invoice, please contact support@lumina.com.", 105, pageHeight - 10, { align: "center" });
  
  return doc;
};


export const generateWishlistPDF = (wishlistItems: Product[], userProfile: UserProfileData) => {
  const doc = new jsPDF();
  
  // Set elegant font
  doc.setFont("helvetica");

  // Top banner
  doc.setFillColor(59, 130, 246); // Brand blue
  doc.rect(0, 0, 210, 40, 'F');
  
  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("LUMINA", 14, 25);
  
  doc.setFontSize(24);
  doc.setFont("helvetica", "normal");
  doc.text("WISHLIST", 140, 25);
  
  // Reset text color
  doc.setTextColor(50, 50, 50);
  
  // Company Info
  doc.setFontSize(10);
  doc.text("Lumina Technologies Inc.", 14, 50);
  doc.text("123 Tech Avenue, Silicon Valley, CA 94025", 14, 55);
  
  // User Details
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Prepared For:", 14, 75);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(userProfile.name || "Valued Customer", 14, 82);
  if (userProfile.email) doc.text(userProfile.email, 14, 87);
  
  doc.setFont("helvetica", "bold");
  doc.text("Details:", 140, 75);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 82);
  doc.text(`Total Items: ${wishlistItems.length}`, 140, 87);
  
  // Table Data
  let totalValue = 0;
  const tableData = wishlistItems.map(item => {
    totalValue += item.price;
    return [
      item.name,
      item.category || "General",
      item.sustainabilityGrade || "N/A",
      `$${item.price.toFixed(2)}`
    ];
  });
  
  autoTable(doc, {
    startY: 100,
    head: [['Product Name', 'Category', 'Eco Grade', 'Price']],
    body: tableData,
    foot: [['', '', 'Estimated Total:', `$${totalValue.toFixed(2)}`]],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: 50 },
    footStyles: { fillColor: [240, 240, 245], textColor: [20, 20, 20], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' }
    },
    margin: { left: 14, right: 14 }
  });
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(245, 245, 245);
  doc.rect(0, pageHeight - 20, 210, 20, 'F');
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("This is a summary of your saved items on Lumina.", 105, pageHeight - 10, { align: "center" });
  
  return doc;
};
