import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a styled PDF statement of user transaction history.
 * 
 * @param {Object} options
 * @param {Object} options.user - The current logged in user object (Volunteer or NGO)
 * @param {Array} options.transactions - Array of donation objects
 * @param {'volunteer' | 'ngo'} options.role - User role
 */
export const exportTransactionsPDF = ({ user, transactions = [], role = 'volunteer' }) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const isVolunteer = role === 'volunteer';
    const userName = isVolunteer ? (user?.name || 'Volunteer') : (user?.ngoName || 'NGO');
    const userEmail = user?.email || 'N/A';
    const totalAmount = transactions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const currentDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Color Palette
    const primaryColor = isVolunteer ? [37, 99, 235] : [5, 150, 105]; // Blue for volunteer, Emerald for NGO
    const textColor = [31, 41, 55];
    const lightGray = [243, 244, 246];

    // --- Header Section ---
    // Brand Banner Background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 32, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Community Connect', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(isVolunteer ? 'Official Donation Statement' : 'Official Contributions Report', 14, 25);

    doc.setFontSize(9);
    doc.text(`Generated: ${currentDate}`, 196, 25, { align: 'right' });

    // --- Summary Box ---
    doc.setFillColor(...lightGray);
    doc.roundedRect(14, 38, 182, 34, 3, 3, 'F');

    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Account Details & Summary', 20, 47);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(`Name: ${userName}`, 20, 55);
    doc.text(`Email: ${userEmail}`, 20, 62);
    doc.text(`Role: ${isVolunteer ? 'Volunteer' : 'NGO Organization'}`, 20, 68);

    doc.setFont('helvetica', 'bold');
    doc.text(`Total Transactions: ${transactions.length}`, 120, 55);
    doc.text(`Total Amount: Rs. ${totalAmount.toLocaleString('en-IN')}`, 120, 62);

    // --- Table Preparation ---
    const tableColumns = isVolunteer
        ? ['#', 'Date', 'NGO', 'Requirement / Cause', 'Method', 'Txn / Ref ID', 'Amount (Rs.)']
        : ['#', 'Date', 'Volunteer', 'Requirement / Cause', 'Method', 'Txn / Ref ID', 'Amount (Rs.)'];

    const tableRows = transactions.map((tx, index) => {
        const dateStr = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-IN') : 'N/A';
        const partyName = isVolunteer
            ? (tx.ngoId?.ngoName || 'N/A')
            : (tx.volunteerId?.name || 'Anonymous');
        const reqTitle = tx.requirementId?.title || 'General Support';
        const method = tx.paymentMethod === 'upi_qr' ? 'UPI QR' : 'Razorpay';
        const txnId = tx.transactionId ? String(tx.transactionId).slice(-12) : '-';
        const amountStr = `Rs. ${Number(tx.amount || 0).toLocaleString('en-IN')}`;

        return [
            index + 1,
            dateStr,
            partyName,
            reqTitle,
            method,
            txnId,
            amountStr
        ];
    });

    // --- Generate AutoTable ---
    autoTable(doc, {
        startY: 78,
        head: [tableColumns],
        body: tableRows,
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'left'
        },
        bodyStyles: {
            fontSize: 8.5,
            textColor: textColor
        },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 24 },
            2: { cellWidth: 38 },
            3: { cellWidth: 46 },
            4: { cellWidth: 22 },
            5: { cellWidth: 24 },
            6: { cellWidth: 18, halign: 'right', fontStyle: 'bold' }
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251]
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(156, 163, 175);
            doc.text(
                'This is a computer-generated transaction statement from Community Connect.',
                14,
                287
            );
            doc.text(
                `Page ${data.pageNumber} of ${pageCount}`,
                196,
                287,
                { align: 'right' }
            );
        }
    });

    // --- Save File ---
    const sanitizedName = userName.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `CommunityConnect_Transactions_${sanitizedName}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
};
