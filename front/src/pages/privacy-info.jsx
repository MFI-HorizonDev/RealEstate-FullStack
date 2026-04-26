import React from "react";
import { Link } from "react-router";

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-xl font-bold text-foreground mb-3">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-primary mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: April 24, 2026</p>

      <p className="text-muted-foreground mb-8 leading-relaxed">
        This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your
        information when You use the Service and tells You about Your privacy rights and how the law protects You.
        We use Your Personal Data to provide and improve the Service. By using the Service, You agree to the
        collection and use of information in accordance with this Privacy Policy.
      </p>

      <Section title="Interpretation and Definitions">
        <p><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</p>
        <p><strong>Company</strong> refers to Real Estate LLC, BGC, Taguig City.</p>
        <p><strong>Cookies</strong> are small files placed on Your device containing details of Your browsing history.</p>
        <p><strong>Country</strong> refers to: Philippines</p>
        <p><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</p>
        <p><strong>Service</strong> refers to the Website.</p>
        <p><strong>Website</strong> refers to Real Estate, accessible from realestate.com.</p>
        <p><strong>You</strong> means the individual accessing or using the Service.</p>
      </Section>

      <Section title="Types of Data Collected">
        <p>While using Our Service, We may ask You to provide personally identifiable information including:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Email address</li>
          <li>First name and last name</li>
          <li>Usage Data (IP address, browser type, pages visited, time and date of visit)</li>
        </ul>
      </Section>

      <Section title="Tracking Technologies and Cookies">
        <p>We use Cookies and similar tracking technologies to track activity on Our Service. We use both Session and Persistent Cookies:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Necessary / Essential Cookies</strong> — Required to provide services and authenticate users.</li>
          <li><strong>Cookies Policy / Notice Acceptance Cookies</strong> — Identify if users have accepted cookie use.</li>
          <li><strong>Functionality Cookies</strong> — Remember choices You make such as login details or language preference.</li>
        </ul>
        <p>Where required by law, non-essential cookies are only used with Your consent. You may withdraw consent at any time through Your browser settings.</p>
      </Section>

      <Section title="Use of Your Personal Data">
        <p>The Company may use Personal Data for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>To provide and maintain our Service</li>
          <li>To manage Your Account and registration</li>
          <li>To contact You regarding updates or security notices</li>
          <li>To manage Your requests</li>
          <li>For business transfers, data analysis, and service improvement</li>
        </ul>
      </Section>

      <Section title="Retention of Your Personal Data">
        <p>We retain Your Personal Data only as long as necessary for the purposes set out in this Policy:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>User Accounts:</strong> Duration of account relationship plus up to 24 months after closure</li>
          <li><strong>Support Data:</strong> Up to 24 months from ticket closure</li>
          <li><strong>Usage/Analytics Data:</strong> Up to 24 months from date of collection</li>
        </ul>
        <p>When retention periods expire, Personal Data is securely deleted or anonymized.</p>
      </Section>

      <Section title="Delete Your Personal Data">
        <p>
          You have the right to delete or request that We assist in deleting the Personal Data We have collected about You.
          You may update or delete Your information at any time by signing in to Your Account and visiting account settings,
          or by contacting Us directly.
        </p>
      </Section>

      <Section title="Security of Your Personal Data">
        <p>
          The security of Your Personal Data is important to Us. While We strive to use commercially reasonable means
          to protect Your Personal Data, no method of transmission over the Internet or electronic storage is 100% secure.
        </p>
      </Section>

      <Section title="Children's Privacy">
        <p>
          Our Service does not address anyone under the age of 16. We do not knowingly collect personally identifiable
          information from anyone under the age of 16. If You are a parent or guardian and believe Your child has
          provided Us with Personal Data, please contact Us immediately.
        </p>
      </Section>

      <Section title="Data Privacy Act of 2012 (RA 10173) Compliance">
        <p>
          We are committed to complying with <strong>Republic Act No. 10173</strong>, also known as the
          <strong> Data Privacy Act of 2012</strong>, and its Implementing Rules and Regulations (IRR)
          as enforced by the <strong>National Privacy Commission (NPC)</strong> of the Philippines.
        </p>
        <p>Our lawful bases for processing Your Personal Data include:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Consent:</strong> You have given clear consent for us to process Your data for specific purposes during registration.</li>
          <li><strong>Contract:</strong> Processing is necessary to fulfill our service agreement with You.</li>
          <li><strong>Legitimate Interest:</strong> Processing is necessary to operate, improve, and secure our platform.</li>
          <li><strong>Legal Obligation:</strong> Processing is necessary for compliance with applicable Philippine laws and regulations.</li>
        </ul>
      </Section>

      <Section title="Your Rights as a Data Subject">
        <p>Under the Data Privacy Act of 2012, You have the following rights:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Right to be Informed</strong> — You have the right to know what Personal Data is being collected and the purpose of processing.</li>
          <li><strong>Right to Access</strong> — You may request access to Your Personal Data held by the Company.</li>
          <li><strong>Right to Object</strong> — You may object to the processing of Your Personal Data at any time.</li>
          <li><strong>Right to Erasure or Blocking</strong> — You may request deletion or blocking of Your Personal Data.</li>
          <li><strong>Right to Rectification</strong> — You may request correction of inaccurate or incomplete Personal Data.</li>
          <li><strong>Right to Data Portability</strong> — You may request a copy of Your data in a machine-readable format.</li>
          <li><strong>Right to File a Complaint</strong> — You may file a complaint with the National Privacy Commission if You believe Your rights have been violated.</li>
          <li><strong>Right to Damages</strong> — You are entitled to claim compensation for damages sustained due to unauthorized processing of Your data.</li>
        </ul>
        <p>
          To exercise any of these rights, contact our Data Protection Officer at{" "}
          <a href="mailto:info@realestate.ph" className="text-primary hover:underline">info@realestate.ph</a>.
        </p>
      </Section>


      <Section title="Changes to this Privacy Policy">
        <p>
          We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new
          Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy
          Policy periodically for any changes.
        </p>
      </Section>

      <Section title="Contact Us">
        <p>If you have any questions about this Privacy Policy, contact us:</p>
        <ul className="list-none space-y-1">
          <li>Email: <a href="mailto:info@realestate.ph" className="text-primary hover:underline">info@realestate.ph</a></li>
          <li>Address: BGC, Taguig City, Philippines</li>
          <li>Phone: +63 (2) 8123 4567</li>
        </ul>
      </Section>

      <div className="mt-10 pt-6 border-t border-border text-sm text-muted-foreground flex gap-4">
        <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
        <Link to="/" className="text-primary hover:underline">Back to Home</Link>
      </div>
    </div>
  );
}
