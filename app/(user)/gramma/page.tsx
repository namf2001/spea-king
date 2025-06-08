'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  ArrowRight,
  Lightbulb,
  Target
} from 'lucide-react';

interface GrammarRule {
  id: string;
  title: string;
  category: string;
  level: 'Cơ bản' | 'Trung cấp' | 'Nâng cao';
  description: string;
  structure: string;
  examples: {
    correct: string;
    incorrect?: string;
    explanation: string;
  }[];
  useCases: string[];
  tips: string[];
}

const grammarData: GrammarRule[] = [
  {
    id: 'present-simple',
    title: 'Thì hiện tại đơn (Present Simple)',
    category: 'Tenses',
    level: 'Cơ bản',
    description: 'Dùng để diễn tả sự thật, thói quen, hoặc những việc xảy ra thường xuyên.',
    structure: 'S + V(s/es) + O',
    examples: [
      {
        correct: 'I work in an office.',
        explanation: 'Diễn tả công việc hiện tại (sự thật)'
      },
      {
        correct: 'She goes to school every day.',
        explanation: 'Diễn tả thói quen hàng ngày'
      },
      {
        correct: 'The sun rises in the east.',
        explanation: 'Diễn tả sự thật hiển nhiên'
      }
    ],
    useCases: [
      'Thói quen, hoạt động thường xuyên',
      'Sự thật hiển nhiên',
      'Lịch trình, thời gian biểu',
      'Cảm xúc, trạng thái'
    ],
    tips: [
      'Với chủ ngữ số ít (he, she, it) thêm s/es vào động từ',
      'Dùng "do/does" trong câu phủ định và nghi vấn',
      'Thường đi với: always, usually, often, sometimes, never'
    ]
  },
  {
    id: 'present-continuous',
    title: 'Thì hiện tại tiếp diễn (Present Continuous)',
    category: 'Tenses',
    level: 'Cơ bản',
    description: 'Dùng để diễn tả hành động đang xảy ra tại thời điểm nói.',
    structure: 'S + am/is/are + V-ing + O',
    examples: [
      {
        correct: 'I am reading a book right now.',
        explanation: 'Hành động đang xảy ra tại thời điểm nói'
      },
      {
        correct: 'They are studying for the exam.',
        explanation: 'Hành động đang diễn ra trong thời gian hiện tại'
      },
      {
        correct: 'She is working on a new project this week.',
        explanation: 'Hành động tạm thời trong thời gian hiện tại'
      }
    ],
    useCases: [
      'Hành động đang xảy ra ngay lúc nói',
      'Hành động tạm thời',
      'Kế hoạch tương lai gần',
      'Thay đổi, xu hướng'
    ],
    tips: [
      'Thường đi với: now, right now, at the moment, currently',
      'Một số động từ không dùng ở thì tiếp diễn: like, love, hate, know',
      'Chú ý cách thêm -ing: stop → stopping, run → running'
    ]
  },
  {
    id: 'past-simple',
    title: 'Thì quá khứ đơn (Past Simple)',
    category: 'Tenses',
    level: 'Cơ bản',
    description: 'Dùng để diễn tả hành động đã xảy ra và kết thúc trong quá khứ.',
    structure: 'S + V-ed/V2 + O',
    examples: [
      {
        correct: 'I visited Paris last year.',
        explanation: 'Hành động đã hoàn thành trong quá khứ'
      },
      {
        correct: 'She worked hard yesterday.',
        explanation: 'Hành động xảy ra tại thời điểm cụ thể trong quá khứ'
      },
      {
        correct: 'They lived in London for 5 years.',
        explanation: 'Trạng thái trong quá khứ đã kết thúc'
      }
    ],
    useCases: [
      'Hành động hoàn thành trong quá khứ',
      'Thói quen trong quá khứ',
      'Chuỗi hành động trong quá khứ',
      'Kể chuyện, tường thuật'
    ],
    tips: [
      'Động từ có quy tắc: thêm -ed',
      'Động từ bất quy tắc: học thuộc lòng (go → went, see → saw)',
      'Thường đi với: yesterday, last week, ago, in 1990'
    ]
  },
  {
    id: 'articles',
    title: 'Mạo từ (Articles): A, An, The',
    category: 'Articles',
    level: 'Trung cấp',
    description: 'Cách sử dụng mạo từ xác định và không xác định trong tiếng Anh.',
    structure: 'a/an + danh từ đếm được số ít; the + danh từ đã xác định',
    examples: [
      {
        correct: 'I saw a cat in the garden.',
        incorrect: 'I saw cat in garden.',
        explanation: 'Dùng "a" cho danh từ lần đầu nhắc đến, "the" cho danh từ đã xác định'
      },
      {
        correct: 'The sun rises in the east.',
        incorrect: 'Sun rises in east.',
        explanation: 'Dùng "the" với các danh từ duy nhất trong tự nhiên'
      },
      {
        correct: 'She is an engineer.',
        explanation: 'Dùng "an" trước nguyên âm (a, e, i, o, u)'
      }
    ],
    useCases: [
      'A/An: danh từ đếm được số ít, lần đầu nhắc đến',
      'The: danh từ đã xác định, duy nhất',
      'Không dùng mạo từ: danh từ không đếm được, số nhiều chung chung'
    ],
    tips: [
      'A + phụ âm (a book, a car)',
      'An + nguyên âm (an apple, an hour)',
      'The + danh từ duy nhất (the moon, the president)'
    ]
  },
  {
    id: 'conditional-sentences',
    title: 'Câu điều kiện (Conditional Sentences)',
    category: 'Conditionals',
    level: 'Nâng cao',
    description: 'Các loại câu điều kiện để diễn tả khả năng, giả định hoặc ước muốn.',
    structure: 'If + điều kiện, kết quả',
    examples: [
      {
        correct: 'If it rains, I will stay home.',
        incorrect: 'If it will rain, I will stay home.',
        explanation: 'Điều kiện loại 1: If + hiện tại đơn, will + V'
      },
      {
        correct: 'If I had money, I would buy a car.',
        incorrect: 'If I would have money, I would buy a car.',
        explanation: 'Điều kiện loại 2: If + quá khứ đơn, would + V'
      },
      {
        correct: 'If I had studied harder, I would have passed the exam.',
        explanation: 'Điều kiện loại 3: If + past perfect, would have + V3'
      }
    ],
    useCases: [
      'Loại 1: Khả năng có thể xảy ra',
      'Loại 2: Giả định không có thật ở hiện tại',
      'Loại 3: Giả định không có thật trong quá khứ'
    ],
    tips: [
      'Loại 1: có thể xảy ra (real condition)',
      'Loại 2: không có thật ở hiện tại (unreal condition)',
      'Loại 3: không có thật trong quá khứ (impossible condition)'
    ]
  },
  {
    id: 'passive-voice',
    title: 'Câu bị động (Passive Voice)',
    category: 'Voice',
    level: 'Trung cấp',
    description: 'Cách chuyển từ câu chủ động sang câu bị động.',
    structure: 'S + be + V3 + (by + O)',
    examples: [
      {
        correct: 'The book was written by Shakespeare.',
        explanation: 'Câu bị động ở thì quá khứ đơn'
      },
      {
        correct: 'The house is being built now.',
        explanation: 'Câu bị động ở thì hiện tại tiếp diễn'
      },
      {
        correct: 'The project will be completed next week.',
        explanation: 'Câu bị động ở thì tương lai đơn'
      }
    ],
    useCases: [
      'Khi không biết ai thực hiện hành động',
      'Khi muốn nhấn mạnh đối tượng chịu tác động',
      'Trong văn viết trang trọng'
    ],
    tips: [
      'Chỉ động từ có tân ngữ mới có thể chuyển thành bị động',
      'By + tác nhân (có thể bỏ qua nếu không quan trọng)',
      'Thay đổi thì của động từ "be" theo thì của câu gốc'
    ]
  },
  {
    id: 'modal-verbs',
    title: 'Động từ khuyết thiếu (Modal Verbs)',
    category: 'Modals',
    level: 'Trung cấp',
    description: 'Các động từ khuyết thiếu để diễn tả khả năng, sự cần thiết, lời khuyên.',
    structure: 'S + Modal + V (nguyên mẫu)',
    examples: [
      {
        correct: 'You should study harder.',
        explanation: 'Should: lời khuyên'
      },
      {
        correct: 'I can speak English.',
        explanation: 'Can: khả năng'
      },
      {
        correct: 'You must finish your homework.',
        explanation: 'Must: sự cần thiết, bắt buộc'
      }
    ],
    useCases: [
      'Can/Could: khả năng, xin phép',
      'Should/Ought to: lời khuyên',
      'Must/Have to: bắt buộc, cần thiết',
      'May/Might: khả năng, xin phép'
    ],
    tips: [
      'Sau modal luôn là động từ nguyên mẫu (không to)',
      'Không thêm s với ngôi thứ 3 số ít',
      'Phủ định: modal + not + V'
    ]
  },
  {
    id: 'reported-speech',
    title: 'Câu tường thuật (Reported Speech)',
    category: 'Speech',
    level: 'Nâng cao',
    description: 'Cách chuyển lời nói trực tiếp thành lời nói gián tiếp.',
    structure: 'S + said/told + (that) + câu tường thuật',
    examples: [
      {
        correct: 'He said that he was tired.',
        explanation: 'Chuyển từ "I am tired" sang câu tường thuật'
      },
      {
        correct: 'She told me that she would come tomorrow.',
        explanation: 'Chuyển từ "I will come tomorrow" sang câu tường thuật'
      },
      {
        correct: 'They asked if I could help them.',
        explanation: 'Câu hỏi Yes/No chuyển thành if/whether'
      }
    ],
    useCases: [
      'Kể lại lời nói của người khác',
      'Báo cáo, tường thuật',
      'Viết văn, kể chuyện'
    ],
    tips: [
      'Lùi thì: hiện tại → quá khứ, quá khứ → quá khứ hoàn thành',
      'Đổi đại từ: I → he/she, you → I/they',
      'Đổi trạng từ thời gian: today → that day, tomorrow → the next day'
    ]
  }
];

export default function GrammarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const categories = ['all', ...Array.from(new Set(grammarData.map(item => item.category)))];
  const levels = ['all', ...Array.from(new Set(grammarData.map(item => item.level)))];

  const filteredData = grammarData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || item.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Cơ bản':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Trung cấp':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Nâng cao':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tenses':
        return <Clock className="h-4 w-4" />;
      case 'Articles':
        return <BookOpen className="h-4 w-4" />;
      case 'Conditionals':
        return <Target className="h-4 w-4" />;
      case 'Voice':
        return <ArrowRight className="h-4 w-4" />;
      case 'Modals':
        return <Lightbulb className="h-4 w-4" />;
      case 'Speech':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Ngữ pháp tiếng Anh
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Tham khảo đầy đủ các quy tắc ngữ pháp tiếng Anh với ví dụ minh họa chi tiết, 
          từ cơ bản đến nâng cao.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm ngữ pháp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="all">Tất cả mức độ</option>
              {levels.slice(1).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>Tìm thấy {filteredData.length} kết quả</span>
        </div>
      </div>

      {/* Grammar Rules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredData.map((rule) => (
          <Card key={rule.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(rule.category)}
                  <CardTitle className="text-xl">{rule.title}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{rule.category}</Badge>
                  <Badge className={getLevelColor(rule.level)}>{rule.level}</Badge>
                </div>
              </div>
              <p className="text-gray-600">{rule.description}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <Tabs defaultValue="structure" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="structure">Cấu trúc</TabsTrigger>
                  <TabsTrigger value="examples">Ví dụ</TabsTrigger>
                  <TabsTrigger value="usage">Cách dùng</TabsTrigger>
                  <TabsTrigger value="tips">Mẹo</TabsTrigger>
                </TabsList>

                <TabsContent value="structure" className="mt-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Cấu trúc:</h4>
                    <code className="text-blue-800 font-mono text-sm bg-white px-2 py-1 rounded">
                      {rule.structure}
                    </code>
                  </div>
                </TabsContent>

                <TabsContent value="examples" className="mt-4">
                  <div className="space-y-3">
                    {rule.examples.map((example, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="font-medium text-green-800">{example.correct}</span>
                        </div>
                        
                        {example.incorrect && (
                          <div className="flex items-start gap-2 mb-2">
                            <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="font-medium text-red-800 line-through">
                              {example.incorrect}
                            </span>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-600 ml-6">
                          <span className="font-medium">Giải thích:</span> {example.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="usage" className="mt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Khi nào sử dụng:</h4>
                    {rule.useCases.map((useCase, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{useCase}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="tips" className="mt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Mẹo ghi nhớ:</h4>
                    {rule.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg">
                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{tip}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Không tìm thấy kết quả
          </h3>
          <p className="text-gray-600">
            Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
          </p>
        </div>
      )}

      {/* Quick Reference */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tham khảo nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">12 Thì cơ bản</h3>
            <p className="text-sm text-gray-600">
              Present, Past, Future với Simple, Continuous, Perfect, Perfect Continuous
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Câu điều kiện</h3>
            <p className="text-sm text-gray-600">
              3 loại câu điều kiện: có thể xảy ra, không có thật, trong quá khứ
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Động từ khuyết thiếu</h3>
            <p className="text-sm text-gray-600">
              Can, Could, May, Might, Must, Should, Will, Would
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}