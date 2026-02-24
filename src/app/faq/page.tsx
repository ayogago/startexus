'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const faqs = [
  {
    category: 'General',
    questions: [
      {
        question: 'What is StartExus?',
        answer: 'StartExus is the world\'s leading marketplace for buying and selling online businesses. We connect entrepreneurs looking to sell their digital ventures with buyers seeking profitable online opportunities.'
      },
      {
        question: 'How does StartExus work?',
        answer: 'Sellers list their businesses on our platform with detailed financials and metrics. Buyers browse listings, conduct due diligence, and make offers. We facilitate the entire transaction process with secure payments and legal support.'
      },
      {
        question: 'What types of businesses are sold on StartExus?',
        answer: 'We facilitate sales of SaaS businesses, eCommerce stores, content blogs, affiliate sites, mobile apps, marketplaces, service businesses, and premium domains.'
      },
      {
        question: 'Is StartExus free to use?',
        answer: 'Browsing listings and creating an account is completely free. We charge a small commission only when a successful transaction is completed.'
      }
    ]
  },
  {
    category: 'For Buyers',
    questions: [
      {
        question: 'How do I find businesses to buy?',
        answer: 'Use our advanced search and filtering system to find businesses by category, price range, revenue, and other criteria. You can also browse our curated collections like "Built for Beginners" or "High Growth" businesses.'
      },
      {
        question: 'How can I verify a business is legitimate?',
        answer: 'All listings undergo our verification process. We require proof of revenue, traffic analytics, and other key metrics. You can also request additional documentation during due diligence.'
      },
      {
        question: 'What information do I get about a business before buying?',
        answer: 'You\'ll see revenue history, traffic data, profit margins, growth metrics, assets included, known risks, and growth opportunities. Premium listings include even more detailed analytics.'
      },
      {
        question: 'Can I negotiate the price?',
        answer: 'Absolutely! Most sellers are open to negotiations. You can make offers below asking price or propose different terms. Our platform facilitates all communication and negotiations.'
      },
      {
        question: 'What happens after I buy a business?',
        answer: 'We provide transfer assistance including domain transfers, account handovers, training materials, and up to 30 days of seller support to ensure a smooth transition.'
      }
    ]
  },
  {
    category: 'For Sellers',
    questions: [
      {
        question: 'How do I list my business for sale?',
        answer: 'Simply click "List Your Business" and fill out our comprehensive form. You\'ll provide business details, financial data, and supporting documents. Our team reviews and approves quality listings.'
      },
      {
        question: 'What documents do I need to provide?',
        answer: 'You\'ll need revenue proof (bank statements, payment processor records), traffic analytics, profit/loss statements, and any relevant business assets. We help you prepare a compelling listing.'
      },
      {
        question: 'How long does it take to sell a business?',
        answer: 'Average time to sale is 30-90 days, depending on the business type, price, and market conditions. Well-documented, profitable businesses typically sell faster.'
      },
      {
        question: 'What fees does StartExus charge?',
        answer: 'We charge a success fee only when your business sells. Our commission ranges from 5-10% depending on the sale price, with no upfront costs or hidden fees.'
      },
      {
        question: 'Can I remain anonymous while selling?',
        answer: 'Yes, we offer confidential listings where your business name and URL remain hidden until you approve a buyer. This protects your business operations during the sale process.'
      }
    ]
  },
  {
    category: 'Transactions & Security',
    questions: [
      {
        question: 'How secure are transactions on StartExus?',
        answer: 'We use bank-level security with encrypted payments, escrow services, and verified user accounts. All transactions are protected by our comprehensive buyer and seller protection policies.'
      },
      {
        question: 'How does payment work?',
        answer: 'We use secure escrow services for all transactions. Funds are held safely until all transfer conditions are met, protecting both buyers and sellers throughout the process.'
      },
      {
        question: 'What if something goes wrong with a transaction?',
        answer: 'Our support team mediates any disputes and we have comprehensive protection policies. We work with both parties to resolve issues fairly and quickly.'
      },
      {
        question: 'Can I get financing to buy a business?',
        answer: 'We partner with specialized lenders who offer financing for online business acquisitions. Many of our buyers secure loans covering 50-80% of the purchase price.'
      }
    ]
  }
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Find answers to common questions about buying and selling online businesses on StartExus
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search frequently asked questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-4 text-lg bg-white text-gray-900 border-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {filteredFaqs.map((category, categoryIndex) => (
              <div key={category.category} className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const itemId = `${categoryIndex}-${faqIndex}`
                    const isOpen = openItems.has(itemId)

                    return (
                      <div key={itemId} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleItem(itemId)}
                          className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4">
                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {filteredFaqs.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No questions found matching "{searchTerm}"</p>
                <Button
                  onClick={() => setSearchTerm('')}
                  variant="outline"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/how-it-works">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}