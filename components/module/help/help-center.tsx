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
    answer: "HeriWill is a comprehensive digital legacy and inheritance planning platform. It helps you organize your digital assets, legal documents, and ensure your wishes are carried out by securely storing and managing information for your heirs."
  },
  {
    category: "Getting Started",
    question: "How do I create my first vault?",
    answer: "Navigate to the Vaults page from the dashboard, click 'Create Vault', choose a category (Share after death, Delete after death, or Sign-off after death), give it a name and description, then start adding items to your vault."
  },
  {
    category: "Getting Started",
    question: "Is my data secure?",
    answer: "Yes, your data is encrypted and stored securely. We use industry-standard encryption protocols to protect your sensitive information. Your vaults and documents are only accessible to you and the heirs you designate."
  },

  // Heirs & Beneficiaries
  {
    category: "Heirs & Beneficiaries",
    question: "How do I add an heir?",
    answer: "Go to the Heirs page, click 'Add Heir', fill in their information (name, email, relationship), choose their heir type, and send the invitation. They'll receive an email with a link to create their account and accept the invitation."
  },
  {
    category: "Heirs & Beneficiaries",
    question: "Can I have multiple heirs?",
    answer: "Yes, you can add as many heirs as you need. Different subscription tiers may have different limits. Pro plan offers unlimited heirs."
  },
  {
    category: "Heirs & Beneficiaries",
    question: "What happens when an heir accepts the invitation?",
    answer: "When an heir accepts your invitation, they create their account and are linked to you. They won't have access to your information until the sign-off conditions are met (based on your chosen trigger method)."
  },

  // Vaults & Assets
  {
    category: "Vaults & Assets",
    question: "What can I store in a vault?",
    answer: "You can store various types of digital items including passwords, documents, photos, videos, notes, and other important files. Each vault can be categorized based on what should happen to it after your passing."
  },
  {
    category: "Vaults & Assets",
    question: "What's the difference between vault categories?",
    answer: "Share after death: Contents are shared with designated heirs. Delete after death: Contents are permanently deleted. Sign-off after death: Requires additional verification before sharing."
  },
  {
    category: "Vaults & Assets",
    question: "How do I add assets?",
    answer: "Go to the Assets page, click 'Add Asset', select the asset type (Real Estate, Vehicle, Bank Account, Investment, etc.), fill in the details, and optionally assign it to specific heirs."
  },

  // Sign-off & Triggers
  {
    category: "Sign-off & Triggers",
    question: "What are sign-off methods?",
    answer: "Sign-off methods determine when your inheritance plan activates. Options include: Inactivity Detection (after no account activity), Trusted Contact (designated person confirms), Heir Notification (heirs verify), Scheduled Date (specific date/time), or Manual Trigger (you activate it)."
  },
  {
    category: "Sign-off & Triggers",
    question: "What is a trusted contact?",
    answer: "A trusted contact is someone you designate (an heir or notary) who can confirm your passing. They'll be contacted to verify the situation before your inheritance plan is activated."
  },
  {
    category: "Sign-off & Triggers",
    question: "How does inactivity detection work?",
    answer: "You set a period of inactivity (e.g., 90 days). If you don't log in or interact with your account for that period, the system will send reminders. If you still don't respond, your sign-off plan will be triggered."
  },

  // Legal Documents
  {
    category: "Legal Documents",
    question: "What legal documents can I upload?",
    answer: "You can upload wills, trusts, powers of attorney, advance directives, property deeds, insurance policies, and other important legal documents. These can be organized and shared with relevant parties."
  },
  {
    category: "Legal Documents",
    question: "Do I need a notary?",
    answer: "While not required for all documents, having a notary can help verify important legal documents. You can add notaries to your account who can assist with document verification."
  },

  // Subscription & Billing
  {
    category: "Subscription & Billing",
    question: "What subscription plans are available?",
    answer: "We offer three plans: Classic (free with basic features), Premium (enhanced features and storage), and Pro (unlimited vaults, heirs, and priority support). Visit the Billing page to see detailed pricing."
  },
  {
    category: "Subscription & Billing",
    question: "How do I upgrade my plan?",
    answer: "Go to Settings → Billing, or click the subscription badge in the header. Choose your desired plan (Premium or Pro), select monthly or yearly billing, and complete the payment process."
  },
  {
    category: "Subscription & Billing",
    question: "Can I cancel my subscription?",
    answer: "Yes, you can cancel anytime from the Billing page. Your subscription will remain active until the end of your current billing period, then revert to the Classic plan."
  },

  // Account & Security
  {
    category: "Account & Security",
    question: "How do I change my password?",
    answer: "Go to Settings → Security, enter your current password, then your new password twice, and click 'Change Password'. Your password must be at least 6 characters long."
  },
  {
    category: "Account & Security",
    question: "How do I update my profile information?",
    answer: "Navigate to Settings → Profile, update your name or email, and click 'Save Changes'. Email changes require verification."
  },
  {
    category: "Account & Security",
    question: "What if I forget my password?",
    answer: "On the login page, click 'Forgot Password', enter your email, and you'll receive a password reset link. Follow the link to create a new password."
  }
]

const CATEGORIES = [
  { name: "Getting Started", icon: HelpCircle },
  { name: "Heirs & Beneficiaries", icon: Users },
  { name: "Vaults & Assets", icon: Vault },
  { name: "Sign-off & Triggers", icon: Calendar },
  { name: "Legal Documents", icon: FileText },
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
      <div className="text-center pb-4">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          Help Center
        </h1>
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
            Can&apos;t find what you&apos;re looking for? Our support team is here to help you with any questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <Button
            onClick={() => window.open('https://heriwill.com/contact', '_blank')}
            className="bg-primary-500 hover:bg-primary-600 h-12 px-6 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Mail className="h-5 w-5 mr-2" />
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
