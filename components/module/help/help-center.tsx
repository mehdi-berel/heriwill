"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ChevronDown, 
  HelpCircle, 
  Mail,
  FileText,
  Users,
  Shield,
  Vault,
  Calendar,
  CreditCard,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FAQItem {
  question: string
  answer: string
  category: string
}

const FAQ_DATA: FAQItem[] = [
  // Getting Started
  {
    category: "Getting Started",
    question: "What is HeriWill?",
    answer: "HeriWill is a comprehensive digital legacy and inheritance planning platform. It helps you organize your digital assets, physical assets, legal documents, and ensure your wishes are carried out by securely storing and managing information for your heirs. With HeriWill, you can create secure vaults, designate heirs, manage assets, and set up inheritance triggers."
  },
  {
    category: "Getting Started",
    question: "How do I create my first vault?",
    answer: "Navigate to the Vaults page from the dashboard and click the '+' button. Choose a vault category (Share, Delete, or Pro for notary services), give it a name and description, then start adding items. You can store passwords, documents, photos, videos, and other important files in your vault."
  },
  {
    category: "Getting Started",
    question: "Is my data secure?",
    answer: "Yes, your data is encrypted and stored securely using Supabase's enterprise-grade security. We use industry-standard encryption protocols to protect your sensitive information. Your vaults and documents are only accessible to you and the heirs you designate after inheritance triggers are activated."
  },
  {
    category: "Getting Started",
    question: "What are the different subscription plans?",
    answer: "Classic (Free): 1 vault, 1 heir, 1GB storage. Legacy (€10/month or €100/year): Unlimited vaults & heirs, 10GB storage, advanced features. Pro (€20/month or €200/year): Everything in Legacy plus 100GB storage, asset management, legal documents, and notary services."
  },

  // Heirs & Beneficiaries
  {
    category: "Heirs & Beneficiaries",
    question: "How do I add an heir?",
    answer: "Go to the Heirs page, click the '+' button, fill in their information (name, email, phone, relationship, heir type), set an expiration date for the invitation (default 7 days), and click 'Send Invitation'. An invitation link will be generated that you can share with them. They can create an account and accept the invitation through the link."
  },
  {
    category: "Heirs & Beneficiaries",
    question: "Can I have multiple heirs?",
    answer: "Yes! Classic plan allows 1 heir, while Legacy and Pro plans offer unlimited heirs. You can assign different access levels (view, partial, or full) to each heir and designate them to specific vaults."
  },
  {
    category: "Heirs & Beneficiaries",
    question: "What happens when an heir accepts the invitation?",
    answer: "When an heir accepts your invitation, they create their HeriWill account and are linked to you as a successor. They'll appear in your 'Heirs' tab with 'accepted' status. They won't have access to your vaults until inheritance is triggered. You can view them in the Heirs page and assign them to specific vaults."
  },
  {
    category: "Heirs & Beneficiaries",
    question: "How do heirs accept invitations?",
    answer: "Heirs receive an invitation link from you. When they open the link, they're directed to create a HeriWill account with their email and password. After account creation, the invitation is automatically accepted and they become linked to you. They can also view pending invitations in their Heirs page under the 'Pending' tab."
  },
  {
    category: "Heirs & Beneficiaries",
    question: "Can I assign heirs to specific vaults?",
    answer: "Yes! Open any vault, click 'Assign Heirs', and select which heirs should have access to that vault. You can assign multiple heirs to a single vault and control their access levels. This is available on all subscription tiers."
  },

  // Vaults & Assets
  {
    category: "Vaults & Assets",
    question: "What can I store in a vault?",
    answer: "You can store various types of items: passwords, documents, photos, videos, notes, files, and encrypted data. Each vault item can have tags, metadata, and be marked as favorite. Storage limits: Classic (1GB), Legacy (10GB), Pro (100GB)."
  },
  {
    category: "Vaults & Assets",
    question: "What's the difference between vault categories?",
    answer: "Share: Contents are shared with designated heirs after inheritance triggers. Delete: Contents are permanently deleted. Pro: Requires notary verification and sign-off before sharing (Pro plan only). You can also mark vaults as favorites, lock them, or share them with specific heirs."
  },
  {
    category: "Vaults & Assets",
    question: "How do I add items to a vault?",
    answer: "Open a vault, click 'Add Item', enter the item details (title, type, content), optionally upload files, add tags for organization, and save. You can search and filter items by type, tags, or favorites. Items support various types including passwords, documents, photos, and more."
  },
  {
    category: "Vaults & Assets",
    question: "How do I manage physical assets?",
    answer: "Go to the Assets page (Pro plan only), click 'Add Asset', select the asset type (Real Estate, Vehicle, Bank Account, Investment, Insurance, Personal Property, Business, or Other), fill in details like value, location, ownership type, attach documents, and assign to heirs. You can track total asset value and organize by type."
  },
  {
    category: "Vaults & Assets",
    question: "What asset types can I track?",
    answer: "Pro plan users can track: Real Estate, Vehicles, Bank Accounts, Investments, Insurance Policies, Personal Property, Business Assets, and Other. Each asset can include value, location, ownership type (sole, joint, tenants in common, community property), documents, notes, and heir assignments."
  },

  // Inheritance & Triggers
  {
    category: "Inheritance & Triggers",
    question: "How does inheritance triggering work?",
    answer: "You can set up inheritance plans that determine when and how your vaults are shared with heirs. The system supports manual triggers where you can activate inheritance immediately, or automated triggers based on inactivity. When triggered, designated heirs receive notifications and gain access to assigned vaults."
  },
  {
    category: "Inheritance & Triggers",
    question: "What is a manual trigger?",
    answer: "Manual trigger allows you to immediately activate your inheritance plan. Go to the Inheritance page and click 'Trigger Inheritance Plan Now'. This will notify all your heirs and grant them access to their assigned vaults. This is useful for testing or immediate activation."
  },
  {
    category: "Inheritance & Triggers",
    question: "Can I create multiple inheritance plans?",
    answer: "Yes, you can create multiple inheritance plans with different configurations. Each plan can have its own name, type, instructions, and trigger conditions. Plans can be activated or deactivated, and you can track which plans have been triggered."
  },
  {
    category: "Inheritance & Triggers",
    question: "What happens when inheritance is triggered?",
    answer: "When triggered: 1) An inheritance trigger record is created, 2) All designated heirs are notified, 3) Heirs gain access to their assigned vaults, 4) Audit logs are created for tracking, 5) Your account status is updated. Vaults remain secure and only accessible to designated heirs."
  },

  // Legal Documents & Notary
  {
    category: "Legal Documents & Notary",
    question: "What legal documents can I upload?",
    answer: "Pro plan users can upload and manage legal documents including wills, trusts, powers of attorney, advance directives, property deeds, insurance policies, and other important documents. Documents are stored securely in the Legal section and can be organized by type and status."
  },
  {
    category: "Legal Documents & Notary",
    question: "How do I add a notary?",
    answer: "Go to the Notary page (Pro plan only), click 'Add Notary', fill in their information (name, firm, email, phone, specialization), and mark if they're your primary notary. You can add multiple notaries and assign them to specific vaults for verification and sign-off."
  },
  {
    category: "Legal Documents & Notary",
    question: "What is a Pro vault?",
    answer: "Pro vaults (available on Pro plan) are special vaults that require notary verification and sign-off before contents are shared with heirs. When you create a Pro vault, you can assign a notary who will be notified to verify and certify the vault contents before inheritance activation."
  },
  {
    category: "Legal Documents & Notary",
    question: "Can notaries access my vaults?",
    answer: "Notaries you designate can be assigned to Pro vaults for verification purposes. They receive notifications when sign-off is required but don&apos;t have automatic access to vault contents. Their role is to verify and certify documents according to your inheritance plan."
  },

  // Subscription & Billing
  {
    category: "Subscription & Billing",
    question: "What subscription plans are available?",
    answer: "Classic (Free): 1 vault, 1 heir, 1GB storage, basic features. Legacy (€10/month or €100/year): Unlimited vaults & heirs, 10GB storage, advanced security, priority support. Pro (€20/month or €200/year): Everything in Legacy + 100GB storage, asset management, legal documents, notary services. Save 17% with yearly billing!"
  },
  {
    category: "Subscription & Billing",
    question: "How do I upgrade my plan?",
    answer: "Click the 'Upgrade' button in the sidebar or visit the Upgrade page. Choose your desired plan (Legacy or Pro), select monthly or yearly billing, and you'll be redirected to our secure payment page powered by RevenueCat. After payment, your account is upgraded immediately."
  },
  {
    category: "Subscription & Billing",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and payment methods through our secure payment processor RevenueCat. You can choose between monthly or yearly billing, with yearly plans offering a 17% discount."
  },
  {
    category: "Subscription & Billing",
    question: "What happens if I reach my storage limit?",
    answer: "If you reach your storage limit, you won't be able to upload new files until you upgrade your plan or delete some items. Classic: 1GB, Legacy: 10GB, Pro: 100GB. You can check your current usage in the dashboard."
  },

  // Account & Security
  {
    category: "Account & Security",
    question: "How do I change my password?",
    answer: "Go to Settings → Security, click 'Change Password', enter your current password, then your new password twice, and click 'Update Password'. Your password must be at least 6 characters long. For security, you'll be logged out and need to sign in again."
  },
  {
    category: "Account & Security",
    question: "How do I update my profile information?",
    answer: "Navigate to Settings → Profile, update your full name or email address, and click 'Save Changes'. Email changes require verification through a confirmation link sent to your new email address."
  },
  {
    category: "Account & Security",
    question: "What if I forget my password?",
    answer: "On the login page, click 'Forgot your password?', enter your email, and you'll receive a password reset link. Follow the link to create a new password. The reset link expires after 24 hours for security."
  },
  {
    category: "Account & Security",
    question: "Can I sign in with Google or LinkedIn?",
    answer: "Yes! HeriWill supports OAuth authentication. On the login or signup page, click 'Sign in with Google' or 'Sign in with LinkedIn' to authenticate using your existing account. This provides a secure and convenient way to access your account."
  },
  {
    category: "Account & Security",
    question: "Is two-factor authentication available?",
    answer: "Account security is managed through Supabase's authentication system. We recommend using a strong, unique password and enabling any additional security features provided by your OAuth provider (Google/LinkedIn) if you use social login."
  },
  {
    category: "Account & Security",
    question: "How is my data encrypted?",
    answer: "All sensitive data including vault contents, heir information, and personal details are encrypted using industry-standard encryption. Data is encrypted at rest in our database and in transit using HTTPS. Only you and your designated heirs (after inheritance triggers) can access your encrypted information."
  }
]

const CATEGORIES = [
  { name: "Getting Started", icon: HelpCircle },
  { name: "Heirs & Beneficiaries", icon: Users },
  { name: "Vaults & Assets", icon: Vault },
  { name: "Inheritance & Triggers", icon: Calendar },
  { name: "Legal Documents & Notary", icon: FileText },
  { name: "Subscription & Billing", icon: CreditCard },
  { name: "Account & Security", icon: Shield }
]

export function HelpCenter() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const filteredFAQs = FAQ_DATA.filter(faq => {
    const matchesCategory = !selectedCategory || faq.category === selectedCategory
    return matchesCategory
  })

  const toggleFAQ = (question: string) => {
    setExpandedFAQ(expandedFAQ === question ? null : question)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 px-4 py-4">
      {/* Header */}
      <div className="text-center pb-6">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent mb-3">
          Help Center
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Find answers to common questions about HeriWill&apos;s features, security, and how to manage your digital legacy
        </p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "h-auto py-3 px-3 flex flex-col items-center gap-2.5 transition-all duration-200",
            selectedCategory === null 
              ? "shadow-lg shadow-primary-500/20" 
              : "hover:border-primary-500/50 hover:bg-gray-800/50"
          )}
        >
          <Settings className="h-6 w-6" />
          <span className="text-[10px] font-medium">All Topics</span>
        </Button>
        {CATEGORIES.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategory === category.name
          return (
            <Button
              key={category.name}
              variant={isSelected ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.name)}
              className={cn(
                "h-auto py-3 px-3 flex flex-col items-center gap-2.5 transition-all duration-200",
                isSelected 
                  ? "shadow-lg shadow-primary-500/20" 
                  : "hover:border-primary-500/50 hover:bg-gray-800/50"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px] font-medium text-center leading-tight">{category.name}</span>
            </Button>
          )
        })}
      </div>

      {/* FAQ List */}
      <div className="space-y-6">
        {selectedCategory && (
          <div className="flex items-center gap-3 pb-2">
            <div className="h-1 w-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" />
            <h2 className="text-2xl md:text-3xl font-semibold">{selectedCategory}</h2>
          </div>
        )}
        
        {filteredFAQs.length === 0 ? (
          <Card className="border-gray-700 shadow-md">
            <CardContent className="py-16 text-center">
              <HelpCircle className="h-16 w-16 mx-auto mb-6 text-text-tertiary opacity-50" />
              <p className="text-text-secondary text-lg">No results found. Try a different category.</p>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((faq, index) => (
            <Card 
              key={index} 
              className={cn(
                "border-gray-700 shadow-md transition-all duration-200",
                expandedFAQ === faq.question 
                  ? "shadow-lg shadow-primary-500/10 border-primary-500/30" 
                  : "hover:shadow-lg hover:border-gray-600"
              )}
            >
              <CardHeader
                className="cursor-pointer hover:bg-gray-800/30 transition-colors p-6"
                onClick={() => toggleFAQ(faq.question)}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <CardTitle className="text-lg md:text-xl font-semibold leading-relaxed">
                      {faq.question}
                    </CardTitle>
                    {!selectedCategory && (
                      <CardDescription className="mt-2 text-sm">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
                          {faq.category}
                        </span>
                      </CardDescription>
                    )}
                  </div>
                  <div className={cn(
                    "flex-shrink-0 transition-transform duration-200",
                    expandedFAQ === faq.question && "rotate-180"
                  )}>
                    <ChevronDown className="h-6 w-6 text-text-tertiary" />
                  </div>
                </div>
              </CardHeader>
              {expandedFAQ === faq.question && (
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="pl-0 pt-4 border-t border-gray-700/50">
                    <p className="text-text-secondary text-base leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Contact Support */}
      <Card className="border-gray-700 bg-gradient-to-br from-primary-900/20 to-primary-800/10 shadow-xl mt-12">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl">
            <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20">
              <Mail className="h-6 w-6 text-primary-400" />
            </div>
            Still need help?
          </CardTitle>
          <CardDescription className="text-base mt-3 leading-relaxed">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help you with any questions about your account, features, or inheritance planning.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => window.open('https://heriwill.com/contact', '_blank')}
              className="bg-primary-500 hover:bg-primary-600 h-12 px-6 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Mail className="h-5 w-5 mr-2" />
              Contact Support
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://heriwill.com', '_blank')}
              className="h-12 px-6 text-base font-medium border-gray-700 hover:border-primary-500/50"
            >
              Visit Website
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Response time: Within 24 hours for Legacy users, within 12 hours for Pro users
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
