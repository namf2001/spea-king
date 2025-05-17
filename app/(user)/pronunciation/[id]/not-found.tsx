import Link from 'next/link'
import { ArrowLeft, FolderSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function PronunciationExerciseNotFound() {
  return (
    <div className="container mx-auto my-12 flex flex-col items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <FolderSearch className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <CardTitle className="text-xl">Không tìm thấy bài tập</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            Bài tập phát âm này không tồn tại hoặc đã bị xóa. Vui lòng thử một bài tập khác.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/pronunciation" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách bài tập
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}