/**
 * Policy versioning — bump version when material terms change; update effective / last-updated dates.
 * @see https://sgi-africa.com/legal/privacy-policy
 */
export const PRIVACY_POLICY_VERSION = "1.0.0" as const

/** ISO 8601 date (YYYY-MM-DD) — policy takes effect for new sessions and in-app display */
export const PRIVACY_POLICY_EFFECTIVE_DATE = "2026-04-28" as const

/** Date of the latest published revision (equals effective on first release) */
export const PRIVACY_POLICY_LAST_UPDATED = "2026-04-28" as const


import { PolicySection } from "@/interfaces/interface";


export const PRIVACY_POLICY_PRODUCT_NAME = "SGI VICOBA"
export const PRIVACY_POLICY_COMPANY = "SGI Africa"
export const PRIVACY_POLICY_CONTACT_EMAIL = "info@sgiafrica.com"
export const PRIVACY_POLICY_WEBSITE = "https://sgi-africa.com"

export const PRIVACY_POLICY_SECTIONS: PolicySection[] = [
    {
        id: "introduction",
        title: "1. Introduction and scope",
        blocks: [
            {
                type: "p",
                text: `${PRIVACY_POLICY_COMPANY} (“we,” “us,” or “our”) provides ${PRIVACY_POLICY_PRODUCT_NAME}, a group savings and financial management platform delivered through our web and mobile applications and supporting services. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use the platform.`,
            },
            {
                type: "p",
                text: "This policy applies to personal data processed in connection with your account, your group’s use of the service, and our communications with you. It should be read together with our product terms and any notices we provide in the application.",
            },
            {
                type: "p",
                text: "We operate with a focus on users in Africa and beyond. Our services are run with infrastructure and support processes appropriate to our operating environment, including the United Republic of Tanzania where applicable.",
            },
        ],
    },
    {
        id: "data-collected",
        title: "2. Information we collect",
        subsections: [
            {
                id: "personal",
                title: "2.1 Personal and account data",
                blocks: [
                    {
                        type: "ul",
                        items: [
                            "First and last name",
                            "Email address",
                            "Telephone number",
                            "Preferred language (e.g. English or Swahili)",
                            "Group membership details, including your role and associations with one or more groups",
                            "Group-related address information you or your group provides, such as country, city or region, and street address where applicable",
                        ],
                    },
                ],
            },
            {
                id: "sensitive",
                title: "2.2 Authentication, payments, and compliance data",
                blocks: [
                    {
                        type: "p",
                        text: "We process data needed to secure accounts, reset access, and meet regulatory or operational requirements:",
                    },
                    {
                        type: "ul",
                        items: [
                            "Passwords and one-time passcodes, processed using appropriate security practices",
                            "Password reset tokens and related records",
                            "Know-your-customer (KYC) materials, such as identity documents in image or PDF form, where we or your group require verification",
                            "Mobile money or payment identifiers used to execute or reconcile transactions you initiate",
                        ],
                    },
                ],
            },
            {
                id: "usage",
                title: "2.3 Operational, financial, and technical records",
                blocks: [
                    {
                        type: "ul",
                        items: [
                            "Delivery and status records for SMS notifications",
                            "Payment webhook and processing logs (where used for transaction reconciliation)",
                            "Password reset request metadata required for security",
                            "Billing and subscription records generated in the ordinary course of service",
                            "Financial and activity history as reflected in the platform (for example contributions, loans, and related entries)",
                        ],
                    },
                    {
                        type: "note",
                        text: "The current web application does not intentionally log Internet Protocol (IP) addresses, device identifiers, or browser user-agent strings for analytics. If that changes, we will update this policy and, where required, provide additional notice.",
                    },
                ],
            },
        ],
    },
    {
        id: "how-we-use",
        title: "3. How we use information",
        blocks: [
            { type: "p", text: "We use personal and related data for the following purposes, as applicable:" },
            {
                type: "ul",
                items: [
                    "To create, authenticate, and maintain user accounts",
                    "To provide group financial features, including contributions, loans, shares, meetings, and related workflows",
                    "To process and record payments, settlements, and reconciliations",
                    "To verify identity or eligibility where required by law, group policy, or risk management",
                    "To send transactional and operational messages by email or SMS, including security alerts and service notices",
                    "To operate, protect, and improve the platform; to monitor abuse; and to comply with legal obligations",
                ],
            },
        ],
    },
    {
        id: "sharing",
        title: "4. Disclosure and subprocessors",
        blocks: [
            {
                type: "p",
                text: "We do not sell your personal data. We share information only with service providers and partners that we engage to run the service, and only to the extent necessary for their function. Examples include:",
            },
            {
                type: "ul",
                items: [
                    "Cloud and document storage providers (for application data and, where applicable, KYC files)",
                    "Payment and mobile-money partners (to initiate or confirm transactions you authorize)",
                    "SMS gateways (to deliver one-time codes and notifications you request or that we are required to send)",
                    "Email delivery providers (for account and transactional email)",
                ],
            },
            {
                type: "p",
                text: "We may disclose information if required by law, regulation, legal process, or governmental request, or to protect the rights, safety, and security of our users, the public, or the service. Any successor to our business in a merger, acquisition, or asset sale will be required to honor commitments consistent with this policy or to provide you notice of any material change.",
            },
        ],
    },
    {
        id: "retention",
        title: "5. Data retention",
        blocks: [
            {
                type: "p",
                text: "We retain personal data for as long as your account is active, as needed to provide the service, and for a reasonable period afterwards to resolve disputes, enforce our agreements, and meet legal, tax, and audit requirements.",
            },
            {
                type: "p",
                text: "When you request deletion of your account, we will delete or irreversibly anonymize personal identifiers where feasible. Certain information may be retained in aggregated or de-identified form, or held longer where the law, a legitimate business need (for example chargeback and fraud prevention), or a court order requires it.",
            },
            {
                type: "p",
                text: "Not all data categories are subject to the same automatic deletion schedule; retention depends on the type of record and our legal obligations. We will document major retention practices in future updates as the product matures.",
            },
        ],
    },
    {
        id: "security",
        title: "6. Security",
        blocks: [
            {
                type: "p",
                text: "We implement administrative, technical, and organizational measures designed to protect personal data against unauthorized access, alteration, disclosure, or destruction. These include secure authentication, access control appropriate to your role, and handling procedures for sensitive categories of data.",
            },
            {
                type: "p",
                text: "No method of electronic storage or transmission is completely secure. While we work to use commercially reasonable safeguards, we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your credentials and for notifying us if you become aware of unauthorized use of your account.",
            },
        ],
    },
    {
        id: "rights",
        title: "7. Your rights and how to exercise them",
        blocks: [
            {
                type: "p",
                text: "Depending on where you live, you may have rights to access, correct, delete, or port your personal data, or to object to or limit certain processing. The exact scope of these rights is determined by applicable law.",
            },
            {
                type: "p",
                text: "You may update much of your profile information directly in the application. You may also contact us to exercise your rights, including account closure requests. For privacy-related requests, including questions about this policy, contact us at the email below.",
            },
        ],
    },
    {
        id: "cookies",
        title: "8. Cookies and similar technologies",
        blocks: [
            {
                type: "p",
                text: "The platform authenticates users using industry-standard token-based access. We do not use cookies for cross-site advertising or third-party analytics in the current web product.",
            },
            {
                type: "p",
                text: "If we introduce optional analytics or non-essential cookies, we will describe them here and, where the law requires, obtain your consent before they are set.",
            },
        ],
    },
    {
        id: "changes",
        title: "9. Changes to this policy",
        blocks: [
            {
                type: "p",
                text: `We may update this Privacy Policy to reflect changes in our practices, features, or the law. When we make material changes, we will post the updated policy in the application and adjust the “Last updated” date and, where appropriate, the version number shown at the top of this page. Your continued use of the service after the effective date of an update constitutes your acceptance of the revised terms, to the extent permitted by law. If we are required to obtain separate consent, we will do so before the new terms take effect for you.`,
            },
        ],
    },
    {
        id: "contact",
        title: "10. Contact us",
        blocks: [
            {
                type: "p",
                text: "If you have questions or concerns about this Privacy Policy or our data practices, you may contact us at:",
            },
            {
                type: "contactList",
                lines: [
                    { variant: "text", text: `Organization: ${PRIVACY_POLICY_COMPANY}` },
                    { variant: "text", text: `Product: ${PRIVACY_POLICY_PRODUCT_NAME}` },
                    {
                        variant: "link",
                        contactLabel: "email",
                        href: `mailto:${PRIVACY_POLICY_CONTACT_EMAIL}`,
                        linkText: PRIVACY_POLICY_CONTACT_EMAIL,
                    },
                    {
                        variant: "link",
                        contactLabel: "web",
                        href: PRIVACY_POLICY_WEBSITE,
                        linkText: PRIVACY_POLICY_WEBSITE,
                        external: true,
                    },
                ],
            },
        ],
    },
]
