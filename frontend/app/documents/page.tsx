"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FileText,
  Upload,
  Search,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Calendar,
  FileImage,
  File,
  Plus,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

interface Document {
  id: number
  name: string
  type: "prescription" | "insurance" | "medical-record" | "lab-result" | "other"
  fileType: "pdf" | "jpg" | "png" | "doc"
  size: string
  uploadDate: string
  verified: boolean
}

const documents: Document[] = [
  {
    id: 1,
    name: "Metformin Prescription - Dr. Smith",
    type: "prescription",
    fileType: "pdf",
    size: "245 KB",
    uploadDate: "2024-01-15",
    verified: true,
  },
  {
    id: 2,
    name: "Insurance Card - Front & Back",
    type: "insurance",
    fileType: "jpg",
    size: "1.2 MB",
    uploadDate: "2024-01-10",
    verified: true,
  },
  {
    id: 3,
    name: "Blood Test Results - January 2024",
    type: "lab-result",
    fileType: "pdf",
    size: "180 KB",
    uploadDate: "2024-01-08",
    verified: false,
  },
  {
    id: 4,
    name: "Medical History Summary",
    type: "medical-record",
    fileType: "doc",
    size: "95 KB",
    uploadDate: "2024-01-05",
    verified: true,
  },
  {
    id: 5,
    name: "Lisinopril Prescription - Dr. Johnson",
    type: "prescription",
    fileType: "pdf",
    size: "198 KB",
    uploadDate: "2023-12-20",
    verified: true,
  },
]

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [documentList, setDocumentList] = useState<Document[]>(documents)

  const handleDelete = (docId: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      setDocumentList((prev) => prev.filter((doc) => doc.id !== docId))
    }
  }

  const handleUpload = () => {
    // In a real app, this would open a file picker
    alert("File upload functionality would be implemented here")
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />
      case "jpg":
      case "png":
        return <FileImage className="h-8 w-8 text-blue-500" />
      case "doc":
        return <File className="h-8 w-8 text-blue-600" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "prescription":
        return "bg-green-100 text-green-800"
      case "insurance":
        return "bg-blue-100 text-blue-800"
      case "medical-record":
        return "bg-purple-100 text-purple-800"
      case "lab-result":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredDocuments = documentList.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || doc.type === selectedType
    return matchesSearch && matchesType
  })

  const documentStats = {
    total: documentList.length,
    verified: documentList.filter((doc) => doc.verified).length,
    pending: documentList.filter((doc) => !doc.verified).length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
            <p className="text-gray-600">Manage your medical documents and prescriptions</p>
          </div>
          <Button onClick={handleUpload}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentStats.total}</div>
              <p className="text-xs text-muted-foreground">Uploaded files</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{documentStats.verified}</div>
              <p className="text-xs text-muted-foreground">Ready to use</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{documentStats.pending}</div>
              <p className="text-xs text-muted-foreground">Under review</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={selectedType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("all")}
                >
                  All
                </Button>
                <Button
                  variant={selectedType === "prescription" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("prescription")}
                >
                  Prescriptions
                </Button>
                <Button
                  variant={selectedType === "insurance" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("insurance")}
                >
                  Insurance
                </Button>
                <Button
                  variant={selectedType === "medical-record" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("medical-record")}
                >
                  Records
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(doc.fileType)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{doc.name}</h3>
                      <p className="text-sm text-gray-500">{doc.size}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getTypeColor(doc.type)} variant="secondary">
                      {doc.type.replace("-", " ")}
                    </Badge>
                    {doc.verified ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Upload your first document to get started"}
              </p>
              <Button onClick={handleUpload}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Upload</CardTitle>
            <CardDescription>Drag and drop files here or click to browse</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={handleUpload}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PDF, JPG, PNG, DOC files up to 10MB</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
