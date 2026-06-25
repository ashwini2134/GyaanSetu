// Fraylon - Phase 2.5 & 3
import { PrismaClient } from '@prisma/client';
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { notificationQueue } from '../lib/queue.js';
import { updatePortfolio } from '../lib/portfolioUpdater.js';

import { prisma } from "../prisma.js";

export async function processCertificate(job: any) {
  const { studentId, courseId } = job.data;
  console.log(`[CertificateWorker] Checking eligibility for student ${studentId}, course ${courseId}`);

  // Determine if eligible. In a real app, verify all lessons, quiz, and project are passed.
  // We'll assume the checks pass for this MVP.
  const isEligible = true;

  if (!isEligible) {
    console.log(`[CertificateWorker] Student not eligible yet.`);
    return;
  }

  // Generate unique Verification ID
  const verificationId = crypto.randomUUID();

  // Create PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const { width, height } = page.getSize();

  page.drawText('Certificate of Completion', {
    x: width / 2 - 120,
    y: height - 80,
    size: 24,
    color: rgb(0.2, 0.2, 0.2),
  });

  const user = await prisma.user.findUnique({ where: { id: studentId } });
  const course = await prisma.course.findUnique({ where: { id: courseId } });

  page.drawText(user?.name || "Student Name", {
    x: width / 2 - 60,
    y: height - 150,
    size: 30,
    color: rgb(0, 0.4, 0.8),
  });

  page.drawText(`has successfully completed: ${course?.title || "Course"}`, {
    x: width / 2 - 150,
    y: height - 200,
    size: 16,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(`Verification ID: ${verificationId}`, {
    x: 50,
    y: 50,
    size: 10,
    color: rgb(0.6, 0.6, 0.6),
  });

  const pdfBytes = await pdfDoc.save();
  const pdfFileName = `cert_${verificationId}.pdf`;
  const uploadDir = path.join(process.cwd(), 'uploads', 'certificates');
  
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, pdfFileName), pdfBytes);

  const pdfUrl = `/uploads/certificates/${pdfFileName}`;

  await prisma.certificate.create({
    data: {
      studentId,
      courseId,
      verificationId,
      pdfUrl
    }
  });

  await updatePortfolio(studentId, 'certificates', { courseId, title: course?.title, url: pdfUrl });
  await notificationQueue.add('certificateReady', { studentId, courseId, pdfUrl });
  console.log(`[CertificateWorker] Generated certificate ${verificationId}`);
}
