import type { Metadata } from "next"
import { PrivacyPolicyPageView } from "@/components/legal/privacy-policy-page-view"
import {
    PRIVACY_POLICY_EFFECTIVE_DATE,
    PRIVACY_POLICY_LAST_UPDATED,
    PRIVACY_POLICY_VERSION,
} from "@/content/privacy-policy"

const path = "/legal/privacy-policy"

const description = `Privacy Policy for SGI VICOBA (SGI Africa). Version ${PRIVACY_POLICY_VERSION}, effective ${PRIVACY_POLICY_EFFECTIVE_DATE}. Describes how we collect, use, and protect personal and group data.`

export const metadata: Metadata = {
    title: "Privacy Policy",
    description,
    keywords: [
        "SGI VICOBA",
        "SGI Africa",
        "privacy policy",
        "data protection",
        "VICOBA",
    ],
    openGraph: {
        type: "article",
        url: path,
        siteName: "SGI VICOBA",
        title: "Privacy Policy | SGI VICOBA",
        description,
        locale: "en_US",
    },
    twitter: {
        card: "summary",
        title: "Privacy Policy | SGI VICOBA",
        description,
    },
    alternates: { canonical: path },
    other: {
        "privacy-policy-version": PRIVACY_POLICY_VERSION,
        "privacy-policy-effective": PRIVACY_POLICY_EFFECTIVE_DATE,
        "privacy-policy-updated": PRIVACY_POLICY_LAST_UPDATED,
    },
    robots: { index: true, follow: true },
}


export default function PrivacyPolicyPage() {
    return <PrivacyPolicyPageView />
}
