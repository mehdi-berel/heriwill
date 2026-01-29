"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageCircle, 
  Mail, 
  Phone, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  Video, 
  Users, 
  Shield, 
  Download, 
  Star,
  Grid3X3,
  List,
  Headphones,
  Zap,
  Plus
} from "lucide-react"

interface UserProfile {
  full_name?: string
  email?: string
  subscription_tier?: string
}

interface SupportOverviewProps {
  userId?: string
  profile?: UserProfile
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  views: number
  helpful: number
  createdAt: string
}

interface Article {
  id: string
  title: string
  description: string
  category: string
  readTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  views: number
  rating: number
  author: string
  createdAt: string
  updatedAt: string
}

interface Ticket {
  id: string
  subject: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
  lastReply?: string
  replies: number
  assignedTo?: string
}

export function SupportOverview({}: SupportOverviewProps) {
  const [activeTab, setActiveTab] = useState('help')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium'
  })

  // Mock data
  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I create an inheritance plan?',
      answer: 'To create an inheritance plan, navigate to the Inheritance section and follow the step-by-step guide. You\'ll need to add beneficiaries, specify assets, and set up distribution preferences.',
      category: 'inheritance',
      views: 1250,
      helpful: 89,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      question: 'How secure are my vaults?',
      answer: 'Your vaults are protected with end-to-end encryption. Only you and people you explicitly share with can access the contents. We use industry-standard security protocols.',
      category: 'security',
      views: 890,
      helpful: 95,
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      question: 'Can I change my beneficiaries later?',
      answer: 'Yes, you can modify your beneficiaries at any time. Simply go to the Heirs section and update the information. Changes take effect immediately.',
      category: 'beneficiaries',
      views: 567,
      helpful: 78,
      createdAt: '2024-01-08'
    },
    {
      id: '4',
      question: 'What happens if I forget my password?',
      answer: 'You can reset your password using the "Forgot Password" link on the login page. We\'ll send a reset link to your registered email address.',
      category: 'account',
      views: 432,
      helpful: 92,
      createdAt: '2024-01-05'
    },
    {
      id: '5',
      question: 'How do I export my data?',
      answer: 'Go to Settings > Danger Zone and click "Export Your Data". You\'ll receive a download link with all your information in a secure format.',
      category: 'data',
      views: 234,
      helpful: 85,
      createdAt: '2024-01-03'
    }
  ]

  const articles: Article[] = [
    {
      id: '1',
      title: 'Complete Guide to Inheritance Planning',
      description: 'Learn everything you need to know about creating a comprehensive inheritance plan.',
      category: 'inheritance',
      readTime: 15,
      difficulty: 'beginner',
      tags: ['inheritance', 'planning', 'guide'],
      views: 3420,
      rating: 4.8,
      author: 'Heriwill Team',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-25'
    },
    {
      id: '2',
      title: 'Security Best Practices for Your Digital Assets',
      description: 'Protect your digital assets with these essential security tips and best practices.',
      category: 'security',
      readTime: 8,
      difficulty: 'intermediate',
      tags: ['security', 'digital assets', 'protection'],
      views: 2156,
      rating: 4.6,
      author: 'Security Team',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-22'
    },
    {
      id: '3',
      title: 'Managing Beneficiaries: A Complete Overview',
      description: 'Everything you need to know about adding, managing, and updating beneficiaries.',
      category: 'beneficiaries',
      readTime: 12,
      difficulty: 'beginner',
      tags: ['beneficiaries', 'management', 'heirs'],
      views: 1876,
      rating: 4.7,
      author: 'Support Team',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '4',
      title: 'Advanced Vault Security Features',
      description: 'Deep dive into advanced security features for your vaults and shared content.',
      category: 'security',
      readTime: 20,
      difficulty: 'advanced',
      tags: ['vaults', 'security', 'advanced'],
      views: 1234,
      rating: 4.9,
      author: 'Security Team',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-18'
    },
    {
      id: '5',
      title: 'Legal Requirements for Digital Inheritance',
      description: 'Understanding the legal aspects of digital inheritance and estate planning.',
      category: 'legal',
      readTime: 25,
      difficulty: 'advanced',
      tags: ['legal', 'digital inheritance', 'requirements'],
      views: 987,
      rating: 4.5,
      author: 'Legal Team',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-15'
    }
  ]

  const tickets: Ticket[] = [
    {
      id: '1',
      subject: 'Issue with vault sharing',
      description: 'I\'m having trouble sharing a vault with my beneficiary. The share link doesn\'t seem to work.',
      category: 'vaults',
      priority: 'medium',
      status: 'in_progress',
      createdAt: '2024-01-25',
      updatedAt: '2024-01-26',
      lastReply: '2024-01-26',
      replies: 3,
      assignedTo: 'Support Agent'
    },
    {
      id: '2',
      subject: 'Password reset not working',
      description: 'I tried to reset my password but I\'m not receiving the reset email.',
      category: 'account',
      priority: 'high',
      status: 'resolved',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-21',
      lastReply: '2024-01-21',
      replies: 5,
      assignedTo: 'Support Agent'
    }
  ]

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'inheritance', label: 'Inheritance' },
    { value: 'security', label: 'Security' },
    { value: 'beneficiaries', label: 'Beneficiaries' },
    { value: 'vaults', label: 'Vaults' },
    { value: 'account', label: 'Account' },
    { value: 'legal', label: 'Legal' },
    { value: 'data', label: 'Data' }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSubmitTicket = () => {
    // In a real app, this would submit the ticket
    console.log('Submitting ticket:', ticketForm)
    // Reset form
    setTicketForm({
      subject: '',
      description: '',
      category: 'general',
      priority: 'medium'
    })
    // Show success message
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">
          Find answers, get help, and contact our support team
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">FAQ Articles</p>
                <p className="text-2xl font-bold">{faqs.length}</p>
              </div>
              <HelpCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Guides</p>
                <p className="text-2xl font-bold">{articles.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Tickets</p>
                <p className="text-2xl font-bold">{tickets.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">2h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="help">Help Center</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="help" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <Card key={faq.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                      <CardDescription className="mt-2">
                        {faq.answer}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {faq.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>{faq.views} views</span>
                      <span>{faq.helpful}% helpful</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Helpful
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="guides" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              
              <div className="flex border border-input rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Articles */}
          {viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className={getDifficultyColor(article.difficulty)}>
                        {article.difficulty}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{article.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {article.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{article.readTime} min read</span>
                        <span>{article.views} views</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>By {article.author}</span>
                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getDifficultyColor(article.difficulty)}>
                            {article.difficulty}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{article.rating}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                        <p className="text-muted-foreground mb-3 line-clamp-2">{article.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {article.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{article.readTime} min</span>
                            <span>{article.views} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Support Tickets</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>

          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{ticket.subject}</h3>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3 line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>#{ticket.id}</span>
                          <span>{ticket.category}</span>
                          <span>{ticket.replies} replies</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          {ticket.lastReply && (
                            <span>Last reply {new Date(ticket.lastReply).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Contact Support</span>
                </CardTitle>
                <CardDescription>
                  Get in touch with our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="general">General</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="account">Account</option>
                    <option value="security">Security</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Please describe your issue in detail"
                    rows={4}
                  />
                </div>
                <Button onClick={handleSubmitTicket} className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Submit Ticket
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Headphones className="h-5 w-5" />
                  <span>Other Ways to Reach Us</span>
                </CardTitle>
                <CardDescription>
                  Multiple channels for support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@heriwill.com</p>
                    <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">1-800-HERIWILL</p>
                    <p className="text-xs text-muted-foreground">Mon-Fri, 9AM-5PM EST</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available 24/7</p>
                    <p className="text-xs text-muted-foreground">Average wait: 2 minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <CardTitle>Documentation</CardTitle>
                </div>
                <CardDescription>
                  Comprehensive guides and API documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Docs
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Video className="h-6 w-6 text-purple-600" />
                  <CardTitle>Video Tutorials</CardTitle>
                </div>
                <CardDescription>
                  Step-by-step video guides and tutorials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Watch Videos
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-green-600" />
                  <CardTitle>Community Forum</CardTitle>
                </div>
                <CardDescription>
                  Connect with other users and get help
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Forum
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Download className="h-6 w-6 text-orange-600" />
                  <CardTitle>Downloads</CardTitle>
                </div>
                <CardDescription>
                  Templates, forms, and other resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Browse Downloads
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-red-600" />
                  <CardTitle>Security Center</CardTitle>
                </div>
                <CardDescription>
                  Security best practices and guidelines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Security Info
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-yellow-600" />
                  <CardTitle>API Reference</CardTitle>
                </div>
                <CardDescription>
                  Developer documentation and API tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  API Docs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
