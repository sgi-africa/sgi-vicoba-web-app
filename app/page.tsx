"use client"

import Link from "next/link"
import {
  Shield,
  Lock,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: false }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
      >
        <div className="container mx-auto flex h-16 max-w-8xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Shield className="h-6 w-6 text-primary" />
            <span>SGI Africa</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Button asChild size="sm">
              <Link href="/auth/register">Get started</Link>
            </Button>
          </nav>
        </div>
      </motion.header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_50%_at_50%_0%,rgba(0,0,0,0.03),transparent)]" />
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              viewport={{ once: false }}
              className="mx-auto max-w-3xl text-center space-y-8"
            >
              <motion.span
                variants={fadeInUp}
                viewport={{ once: false }}
                className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
              >
                Trusted across Africa
              </motion.span>
              <motion.h1
                variants={fadeInUp}
                viewport={{ once: false }}
                className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Get started.
                <span className="block text-primary">Stay secure.</span>
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                viewport={{ once: false }}
                className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto"
              >
                SGI Africa helps you manage risk and protect what matters most.
                Join thousands of professionals who trust us every day.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                viewport={{ once: false }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button asChild size="lg" className="text-base h-12 px-8">
                  <Link href="/auth/register" className="inline-flex items-center gap-2">
                    Create free account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base h-12 px-8">
                  <Link href="/auth/login">Sign in</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 sm:py-32 border-t border-border/40 bg-muted/30">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-2xl text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built for security and simplicity
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to stay protected, without the complexity.
              </p>
            </motion.div>
            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: false }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[
                {
                  icon: Shield,
                  title: "Enterprise-grade security",
                  desc: "Bank-level encryption and compliance standards keep your data safe and protected at all times.",
                },
                {
                  icon: Lock,
                  title: "Access control",
                  desc: "Granular permissions and role-based access ensure the right people see the right information.",
                },
                {
                  icon: Zap,
                  title: "Fast and reliable",
                  desc: "Built for performance. Access your dashboard and manage operations from anywhere, anytime.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <motion.div key={title} variants={fadeInUp} viewport={{ once: false }}>
                  <Card className="border-border/50 bg-card/50 backdrop-blur h-full transition-shadow hover:shadow-md">
                    <CardHeader className="px-5 py-5 sm:px-6 sm:py-6">
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle>{title}</CardTitle>
                      <CardDescription>{desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 sm:py-32">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5 }}
                className="max-w-xl"
              >
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Why teams choose SGI Africa
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  From startups to enterprises, we provide the tools and peace of
                  mind you need to focus on what matters.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Secure, compliant infrastructure",
                    "Real-time monitoring and alerts",
                    "Dedicated support when you need it",
                    "Scalable for growing teams",
                  ].map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5 }}
                className="flex justify-center lg:justify-end"
              >
                <Card className="w-full max-w-md border-2 border-primary/10 bg-linear-to-br from-primary/5 to-transparent p-6">
                  <CardHeader className="p-0">
                    <CardTitle className="text-2xl">
                      Ready to get started?
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Create your free account in under a minute. No credit card
                      required.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 pt-5">
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <Link href="/auth/register" className="inline-flex items-center gap-2">
                        Create free account
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
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
        className="border-t border-border/40 py-12"
      >
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground transition-colors">
              <Shield className="h-5 w-5" />
              SGI Africa
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/auth/login" className="hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Link href="/auth/register" className="hover:text-foreground transition-colors">
                Get started
              </Link>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} SGI Africa. All rights reserved.
          </p>
        </div>
      </motion.footer>
    </div>
  )
}
