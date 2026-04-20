"use client"

import Link from "next/link"
import { Shield, Lock, Zap, ArrowRight, CheckCircle2, Coins } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "react-i18next"
import LanguageSwitcher from "@/components/global/language-switcher"
import Image from "next/image"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
}

const pricingCardMotion = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  whileHover: { y: -6, scale: 1.01 },
  viewport: { once: true },
  transition: { duration: 0.35 },
}

export default function Home() {
  const { t } = useTranslation()
  const subscriptionBrackets = [
    {
      id: "range1",
      groupSize: "1-20 members",
      perMemberFee: "TZS 1,000",
      exampleKey: "pricing.brackets.range1.example",
    },
    {
      id: "range2",
      groupSize: "21-40 members",
      perMemberFee: "TZS 900",
      exampleKey: "pricing.brackets.range2.example",
    },
    {
      id: "range3",
      groupSize: "41-70 members",
      perMemberFee: "TZS 850",
      exampleKey: "pricing.brackets.range3.example",
    },
    {
      id: "range4",
      groupSize: "71+ members",
      perMemberFee: "TZS 800",
      exampleKey: "pricing.brackets.range4.example",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/sgi.svg"
              alt="SGI VICOBA"
              width={48}
              height={48}
              className="h-9 w-9 sm:h-10 sm:w-10"
              priority
            />
            <span className="font-semibold text-foreground tracking-tight">
              {t("header.brand")}
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <div className="hidden md:flex md:items-center md:gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("header.signIn")}
              </Link>
              <Button asChild size="sm">
                <Link href="/auth/register">{t("header.getStarted")}</Link>
              </Button>
            </div>
            <LanguageSwitcher />
          </nav>
        </div>
      </motion.header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_0%,hsl(var(--brand-accent)/0.06),transparent)]" />
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="mx-auto max-w-3xl text-center space-y-8"
            >
              <motion.span
                variants={fadeInUp}
                className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
              >
                {t("hero.trusted")}
              </motion.span>
              <motion.h1
                variants={fadeInUp}
                className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
              >
                {t("hero.titleStart")}
                <span className="block text-primary">{t("hero.titleEnd")}</span>
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto leading-relaxed"
              >
                {t("hero.description")}
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-3 justify-center"
              >
                <Button asChild size="lg" className="text-base h-12 px-8">
                  <Link href="/auth/register" className="inline-flex items-center gap-2">
                    {t("hero.createAccount")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base h-12 px-8 border-border/60">
                  <Link href="/auth/login">{t("hero.signIn")}</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 sm:py-32 border-t border-border/40 bg-card">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mx-auto max-w-2xl text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {t("features.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {t("features.description")}
              </p>
            </motion.div>
            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[
                {
                  icon: Shield,
                  title: t("features.items.security.title"),
                  desc: t("features.items.security.desc"),
                },
                {
                  icon: Lock,
                  title: t("features.items.access.title"),
                  desc: t("features.items.access.desc"),
                },
                {
                  icon: Zap,
                  title: t("features.items.fast.title"),
                  desc: t("features.items.fast.desc"),
                },
              ].map(({ icon: Icon, title, desc }) => (
                <motion.div key={title} variants={fadeInUp}>
                  <Card className="border-border/50 bg-background h-full transition-all hover:shadow-md hover:border-border">
                    <CardHeader className="p-6">
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <CardTitle className="text-base">{title}</CardTitle>
                      <CardDescription className="leading-relaxed">{desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 sm:py-32 border-t border-border/40 bg-card">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mx-auto max-w-2xl text-center mb-16"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
                <Coins className="h-3.5 w-3.5" />
                {t("pricing.badge")}
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {t("pricing.title")}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {t("pricing.description")}
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid gap-6 lg:grid-cols-2"
            >
              <motion.div {...pricingCardMotion}>
                <Card className="h-full border-border/50 bg-background">
                  <CardHeader className="p-6 pb-4">
                    <CardTitle className="text-lg">{t("pricing.breakdown.title")}</CardTitle>
                    <CardDescription className="leading-relaxed">
                      {t("pricing.breakdown.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-3">
                      {subscriptionBrackets.map((bracket) => (
                        <div
                          key={bracket.id}
                          className="rounded-lg border border-border/50 bg-muted/20 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
                        >
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-medium text-foreground">
                              {t(`pricing.brackets.${bracket.id}.groupSize`)}
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {t("pricing.bracketPerMember", { amount: bracket.perMemberFee })}
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t("pricing.examplePrefix")}{" "}
                            {t(bracket.exampleKey)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div {...pricingCardMotion} transition={{ duration: 0.4, delay: 0.05 }}>
                <Card className="h-full border-primary/30 bg-linear-to-br from-primary/5 via-background to-background">
                  <CardHeader className="p-6 pb-4">
                    <CardTitle className="text-lg">
                      {t("pricing.cap.title")}
                    </CardTitle>
                    <CardDescription className="leading-relaxed">
                      {t("pricing.cap.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-4xl font-bold tracking-tight text-foreground">
                      {t("pricing.cap.amount")}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t("pricing.cap.subtext")}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {(Array.isArray(t("pricing.cap.notes", { returnObjects: true }))
                        ? (t("pricing.cap.notes", { returnObjects: true }) as string[])
                        : []
                      ).map((note) => (
                        <li key={note} className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {note}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="mt-8 rounded-xl border border-border/50 bg-background px-5 py-4 text-sm text-muted-foreground"
            >
              {t("pricing.fairnessNote")}
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="max-w-xl"
              >
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {t("benefits.title")}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                  {t("benefits.description")}
                </p>
                <ul className="mt-8 space-y-4">
                  {(Array.isArray(t("benefits.items", { returnObjects: true }))
                    ? t("benefits.items", { returnObjects: true }) as string[]
                    : []
                  ).map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="flex justify-center lg:justify-end"
              >
                <Card className="w-full max-w-md border border-primary/15 bg-linear-to-br from-primary/5 via-transparent to-transparent shadow-sm">
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-xl">{t("benefits.cta.title")}</CardTitle>
                    <CardDescription className="text-base mt-1 leading-relaxed">
                      {t("benefits.cta.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-4">
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <Link href="/auth/register" className="inline-flex items-center gap-2">
                        {t("benefits.cta.button")}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 bg-card">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Image
                src="/sgi.svg"
                alt="SGI VICOBA"
                width={40}
                height={40}
                className="h-9 w-9"
              />
              <span className="text-sm font-medium">{t("footer.brand")}</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/auth/login" className="hover:text-foreground transition-colors">
                {t("header.signIn")}
              </Link>
              <Link href="/auth/register" className="hover:text-foreground transition-colors">
                {t("header.getStarted")}
              </Link>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  )
}
