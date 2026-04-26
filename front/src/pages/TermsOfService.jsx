import React, { useState } from "react";
import { Link } from "react-router";

const Section = ({ id, title, children }) => (
  <section id={id} className="mb-8">
    <h2 className="text-xl font-bold text-foreground mb-3">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
  </section>
);

const toc = [
  [1, "OUR SERVICES"],
  [2, "INTELLECTUAL PROPERTY RIGHTS"],
  [3, "USER REPRESENTATIONS"],
  [4, "USER REGISTRATION"],
  [5, "PURCHASES AND PAYMENT"],
  [6, "PROHIBITED ACTIVITIES"],
  [7, "USER GENERATED CONTRIBUTIONS"],
  [8, "CONTRIBUTION LICENSE"],
  [9, "SERVICES MANAGEMENT"],
  [10, "PRIVACY POLICY"],
  [11, "COPYRIGHT INFRINGEMENTS"],
  [12, "TERM AND TERMINATION"],
  [13, "MODIFICATIONS AND INTERRUPTIONS"],
  [14, "GOVERNING LAW"],
  [15, "DISPUTE RESOLUTION"],
  [16, "CORRECTIONS"],
  [17, "DISCLAIMER"],
  [18, "LIMITATIONS OF LIABILITY"],
  [19, "INDEMNIFICATION"],
  [20, "USER DATA"],
  [21, "ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES"],
  [22, "MISCELLANEOUS"],
  [23, "CONTACT US"],
];

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-primary mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-4">Last updated: April 24, 2026</p>

      <div className="bg-secondary border border-border rounded-xl p-6 mb-10">
        <p className="text-muted-foreground leading-relaxed">
          We are <strong>Real Estate Limited Liability Company</strong> ("Company," "we," "us," "our"), registered in
          the Philippines at BGC, Taguig City. We operate the website <strong>realestate.com</strong>. By accessing
          the Services, you have read, understood, and agreed to be bound by all of these Legal Terms.{" "}
          <strong>IF YOU DO NOT AGREE, YOU MUST DISCONTINUE USE IMMEDIATELY.</strong>
        </p>
        <p className="text-muted-foreground mt-3">
          The Services are intended for users who are at least <strong>18 years old</strong>.
        </p>
      </div>

      {/* Table of Contents */}
      <div className="mb-10 bg-muted/50 rounded-xl p-6 border border-border">
        <h2 className="font-bold text-foreground mb-4 uppercase tracking-wider text-sm">Table of Contents</h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
          {toc.map(([num, title]) => (
            <li key={num}>
              <a href={`#section-${num}`} className="text-blue-800 hover:underline">
                {num}. {title}
              </a>
            </li>
          ))}
        </ol>
      </div>

      <Section id="section-1" title="1. Our Services">
        <p>
          The information provided when using the Services is not intended for distribution to or use by any person
          or entity in any jurisdiction where such distribution would be contrary to law or regulation.
        </p>
      </Section>

      <Section id="section-2" title="2. Intellectual Property Rights">
        <p>
          We are the owner or licensee of all intellectual property rights in our Services, including all source code,
          databases, functionality, software, website designs, audio, video, text, photographs, and graphics.
          Our Content and Marks are protected by copyright and trademark laws.
        </p>
        <p>
          Subject to your compliance with these Legal Terms, we grant you a non-exclusive, non-transferable,
          revocable license to access the Services for your personal, non-commercial use only.
        </p>
      </Section>

      <Section id="section-3" title="3. User Representations">
        <p>By using the Services, you represent and warrant that:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>All registration information you submit will be true, accurate, current, and complete</li>
          <li>You have the legal capacity and agree to comply with these Legal Terms</li>
          <li>You are not a minor in the jurisdiction in which you reside</li>
          <li>You will not access the Services through automated or non-human means</li>
          <li>Your use of the Services will not violate any applicable law or regulation</li>
        </ul>
      </Section>

      <Section id="section-4" title="4. User Registration">
        <p>
          You may be required to register to use the Services. You agree to keep your password confidential and
          will be responsible for all use of your account and password.
        </p>
      </Section>

      <Section id="section-5" title="5. Purchases and Payment">
        <p>
          You agree to provide current, complete, and accurate purchase and account information for all purchases
          made via the Services. We may change prices at any time. We reserve the right to refuse any order placed
          through the Services.
        </p>
      </Section>

      <Section id="section-6" title="6. Prohibited Activities">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1 text-sm">
          <li>Systematically retrieve data to create databases without written permission</li>
          <li>Trick, defraud, or mislead other users</li>
          <li>Circumvent or disable security-related features of the Services</li>
          <li>Upload viruses, Trojan horses, or other malicious material</li>
          <li>Attempt to impersonate another user or person</li>
          <li>Post properties without written authority from the registered property owner</li>
          <li>Use misleading, false, or digitally altered photographs to misrepresent a property</li>
          <li>Fabricate interest or offers on a property ("Phantom Bidding")</li>
          <li>Offer to sell subdivision or condominium units lacking a valid License to Sell (LTS) from DHSUD</li>
          <li>Intentionally conceal known property defects or structural flaws</li>
          <li>Represent both buyer and seller without disclosing dual agency to both parties</li>
          <li>Post content that is abusive, defamatory, threatening, or harmful</li>
          <li>Copy property listings or photos from other agents without authorization</li>
        </ul>
      </Section>

      <Section id="section-7" title="7. User Generated Contributions">
        <p>
          Any Contributions you transmit may be treated as non-confidential and non-proprietary. You represent and
          warrant that your Contributions are not false, inaccurate, or misleading, and do not violate any applicable
          law, regulation, or the rights of any third party.
        </p>
      </Section>

      <Section id="section-8" title="8. Contribution License">
        <p>
          By posting Contributions, you grant us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive,
          transferable, royalty-free, fully-paid, worldwide right and license to use, copy, reproduce, distribute,
          sell, publish, and exploit your Contributions for any purpose. You retain full ownership of your Contributions.
        </p>
      </Section>

      <Section id="section-9" title="9. Services Management">
        <p>
          We reserve the right to monitor the Services for violations, take appropriate legal action, remove or
          disable content that is excessive or burdensome, and otherwise manage the Services to protect our rights
          and property.
        </p>
      </Section>

      <Section id="section-10" title="10. Privacy Policy">
        <p>
          We care about data privacy and security. Please review our{" "}
          <Link to="/privacy" className="text-blue-800 hover:underline">Privacy Policy</Link>.
          By using the Services, you agree to be bound by our Privacy Policy. The Services are hosted in the Philippines.
        </p>
      </Section>

      <Section id="section-11" title="11. Copyright Infringements">
        <p>
          We respect the intellectual property rights of others. If you believe that any material available on or
          through the Services infringes upon any copyright you own or control, please notify us immediately using
          the contact information provided below.
        </p>
      </Section>

      <Section id="section-12" title="12. Term and Termination">
        <p>
          These Legal Terms shall remain in full force and effect while you use the Services. We reserve the right
          to deny access, terminate your use, or delete your account at any time without warning in our sole discretion.
        </p>
      </Section>

      <Section id="section-13" title="13. Modifications and Interruptions">
        <p>
          We reserve the right to change, modify, or remove the contents of the Services at any time without notice.
          We cannot guarantee the Services will be available at all times and will not be liable for any loss caused
          by inability to access the Services.
        </p>
      </Section>

      <Section id="section-14" title="14. Governing Law">
        <p>
          These Legal Terms shall be governed by and defined following the laws of the Philippines. Real Estate
          Limited Liability Company and yourself irrevocably consent that the courts of the Philippines shall have
          exclusive jurisdiction to resolve any dispute.
        </p>
      </Section>

      <Section id="section-15" title="15. Dispute Resolution">
        <p>
          The Parties agree to first attempt to negotiate any Dispute informally for at least thirty (30) days
          before initiating arbitration. Any unresolved dispute shall be referred to the International Commercial
          Arbitration Court under the European Arbitration Chamber. The seat of arbitration shall be Pasig City,
          Philippines. The language of proceedings shall be English.
        </p>
      </Section>

      <Section id="section-16" title="16. Corrections">
        <p>
          There may be information on the Services that contains typographical errors, inaccuracies, or omissions.
          We reserve the right to correct any errors and update information at any time without prior notice.
        </p>
      </Section>

      <Section id="section-17" title="17. Disclaimer">
        <p className="uppercase text-sm font-medium text-muted-foreground">
          The Services are provided on an as-is and as-available basis. To the fullest extent permitted by law,
          we disclaim all warranties, express or implied. We make no warranties about the accuracy or completeness
          of the Services' content and assume no liability for errors, personal injury, unauthorized access, or
          interruption of transmission.
        </p>
      </Section>

      <Section id="section-18" title="18. Limitations of Liability">
        <p className="uppercase text-sm font-medium text-muted-foreground">
          In no event will we or our directors, employees, or agents be liable to you or any third party for any
          direct, indirect, consequential, exemplary, incidental, special, or punitive damages arising from your
          use of the Services.
        </p>
      </Section>

      <Section id="section-19" title="19. Indemnification">
        <p>
          You agree to defend, indemnify, and hold us harmless from and against any loss, damage, liability, claim,
          or demand arising out of your Contributions, use of the Services, breach of these Legal Terms, or violation
          of the rights of a third party.
        </p>
      </Section>

      <Section id="section-20" title="20. User Data">
        <p>
          We will maintain certain data that you transmit to the Services for the purpose of managing performance.
          You are solely responsible for all data that you transmit or that relates to any activity you have
          undertaken using the Services.
        </p>
      </Section>

      <Section id="section-21" title="21. Electronic Communications, Transactions, and Signatures">
        <p>
          Visiting the Services, sending us emails, and completing online forms constitute electronic communications.
          You consent to receive electronic communications and agree that all agreements and notices provided
          electronically satisfy any legal requirement that such communication be in writing.
        </p>
      </Section>

      <Section id="section-22" title="22. Miscellaneous">
        <p>
          These Legal Terms constitute the entire agreement between you and us. Our failure to exercise any right
          or provision shall not operate as a waiver. If any provision is determined to be unlawful or unenforceable,
          it is deemed severable and does not affect the validity of remaining provisions.
        </p>
      </Section>

      <Section id="section-23" title="23. Contact Us">
        <p>To resolve a complaint or receive further information, contact us at:</p>
        <ul className="list-none space-y-1">
          <li><strong>Real Estate Limited Liability Company</strong></li>
          <li>BGC, Taguig City, Philippines</li>
          <li>Phone: +63 (2) 8123 4567</li>
          <li>Email: <a href="mailto:info@realestate.ph" className="text-primary hover:underline">info@realestate.ph</a></li>
        </ul>
      </Section>

      <div className="mt-10 pt-6 border-t border-border text-sm text-muted-foreground flex gap-4">
        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        <Link to="/" className="text-primary hover:underline">Back to Home</Link>
      </div>
    </div>
  );
}
