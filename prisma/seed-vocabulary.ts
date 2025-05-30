import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data vocabulary exercises cho test
const vocabularyExercisesData = [
  {
    title: 'Từ vựng cơ bản hàng ngày',
    description: 'Học các từ vựng tiếng Anh cơ bản thường dùng trong cuộc sống hàng ngày',
    pairs: [
      { englishWord: 'hello', vietnameseWord: 'xin chào' },
      { englishWord: 'goodbye', vietnameseWord: 'tạm biệt' },
      { englishWord: 'thank you', vietnameseWord: 'cảm ơn' },
      { englishWord: 'please', vietnameseWord: 'làm ơn' },
      { englishWord: 'sorry', vietnameseWord: 'xin lỗi' },
      { englishWord: 'excuse me', vietnameseWord: 'xin lỗi/cho phép' },
      { englishWord: 'water', vietnameseWord: 'nước' },
      { englishWord: 'food', vietnameseWord: 'thức ăn' },
      { englishWord: 'house', vietnameseWord: 'nhà' },
      { englishWord: 'school', vietnameseWord: 'trường học' },
    ],
  },
  {
    title: 'Gia đình và người thân',
    description: 'Từ vựng về các thành viên trong gia đình và mối quan hệ',
    pairs: [
      { englishWord: 'family', vietnameseWord: 'gia đình' },
      { englishWord: 'father', vietnameseWord: 'bố/cha' },
      { englishWord: 'mother', vietnameseWord: 'mẹ/mẹ' },
      { englishWord: 'brother', vietnameseWord: 'anh/em trai' },
      { englishWord: 'sister', vietnameseWord: 'chị/em gái' },
      { englishWord: 'grandfather', vietnameseWord: 'ông nội/ngoại' },
      { englishWord: 'grandmother', vietnameseWord: 'bà nội/ngoại' },
      { englishWord: 'uncle', vietnameseWord: 'chú/bác/cậu' },
      { englishWord: 'aunt', vietnameseWord: 'cô/dì/thím' },
      { englishWord: 'cousin', vietnameseWord: 'anh/chị/em họ' },
    ],
  },
  {
    title: 'Màu sắc cơ bản',
    description: 'Học các từ vựng về màu sắc thường gặp',
    pairs: [
      { englishWord: 'red', vietnameseWord: 'màu đỏ' },
      { englishWord: 'blue', vietnameseWord: 'màu xanh dương' },
      { englishWord: 'green', vietnameseWord: 'màu xanh lá' },
      { englishWord: 'yellow', vietnameseWord: 'màu vàng' },
      { englishWord: 'orange', vietnameseWord: 'màu cam' },
      { englishWord: 'purple', vietnameseWord: 'màu tím' },
      { englishWord: 'pink', vietnameseWord: 'màu hồng' },
      { englishWord: 'brown', vietnameseWord: 'màu nâu' },
      { englishWord: 'black', vietnameseWord: 'màu đen' },
      { englishWord: 'white', vietnameseWord: 'màu trắng' },
    ],
  },
  {
    title: 'Số đếm từ 1-20',
    description: 'Học cách đếm số từ 1 đến 20 trong tiếng Anh',
    pairs: [
      { englishWord: 'one', vietnameseWord: 'một' },
      { englishWord: 'two', vietnameseWord: 'hai' },
      { englishWord: 'three', vietnameseWord: 'ba' },
      { englishWord: 'four', vietnameseWord: 'bốn' },
      { englishWord: 'five', vietnameseWord: 'năm' },
      { englishWord: 'six', vietnameseWord: 'sáu' },
      { englishWord: 'seven', vietnameseWord: 'bảy' },
      { englishWord: 'eight', vietnameseWord: 'tám' },
      { englishWord: 'nine', vietnameseWord: 'chín' },
      { englishWord: 'ten', vietnameseWord: 'mười' },
    ],
  },
  {
    title: 'Thức ăn và đồ uống',
    description: 'Từ vựng về các loại thức ăn và đồ uống phổ biến',
    pairs: [
      { englishWord: 'rice', vietnameseWord: 'cơm/gạo' },
      { englishWord: 'bread', vietnameseWord: 'bánh mì' },
      { englishWord: 'meat', vietnameseWord: 'thịt' },
      { englishWord: 'fish', vietnameseWord: 'cá' },
      { englishWord: 'chicken', vietnameseWord: 'gà' },
      { englishWord: 'egg', vietnameseWord: 'trứng' },
      { englishWord: 'milk', vietnameseWord: 'sữa' },
      { englishWord: 'coffee', vietnameseWord: 'cà phê' },
      { englishWord: 'tea', vietnameseWord: 'trà' },
      { englishWord: 'fruit', vietnameseWord: 'trái cây' },
    ],
  },
  {
    title: 'Động vật quen thuộc',
    description: 'Học từ vựng về các loài động vật thường gặp',
    pairs: [
      { englishWord: 'dog', vietnameseWord: 'chó' },
      { englishWord: 'cat', vietnameseWord: 'mèo' },
      { englishWord: 'bird', vietnameseWord: 'chim' },
      { englishWord: 'fish', vietnameseWord: 'cá' },
      { englishWord: 'cow', vietnameseWord: 'bò' },
      { englishWord: 'pig', vietnameseWord: 'heo/lợn' },
      { englishWord: 'chicken', vietnameseWord: 'gà' },
      { englishWord: 'duck', vietnameseWord: 'vịt' },
      { englishWord: 'rabbit', vietnameseWord: 'thỏ' },
      { englishWord: 'horse', vietnameseWord: 'ngựa' },
    ],
  },
  {
    title: 'Quần áo và phụ kiện',
    description: 'Từ vựng về trang phục và phụ kiện thời trang',
    pairs: [
      { englishWord: 'shirt', vietnameseWord: 'áo sơ mi' },
      { englishWord: 'pants', vietnameseWord: 'quần dài' },
      { englishWord: 'dress', vietnameseWord: 'váy/đầm' },
      { englishWord: 'shoes', vietnameseWord: 'giày' },
      { englishWord: 'hat', vietnameseWord: 'mũ' },
      { englishWord: 'jacket', vietnameseWord: 'áo khoác' },
      { englishWord: 'socks', vietnameseWord: 'tất' },
      { englishWord: 'bag', vietnameseWord: 'túi xách' },
      { englishWord: 'watch', vietnameseWord: 'đồng hồ đeo tay' },
      { englishWord: 'glasses', vietnameseWord: 'kính mắt' },
    ],
  },
  {
    title: 'Phòng trong nhà',
    description: 'Học tên các phòng và khu vực trong ngôi nhà',
    pairs: [
      { englishWord: 'kitchen', vietnameseWord: 'nhà bếp' },
      { englishWord: 'bedroom', vietnameseWord: 'phòng ngủ' },
      { englishWord: 'bathroom', vietnameseWord: 'phòng tắm' },
      { englishWord: 'living room', vietnameseWord: 'phòng khách' },
      { englishWord: 'dining room', vietnameseWord: 'phòng ăn' },
      { englishWord: 'garden', vietnameseWord: 'vườn' },
      { englishWord: 'garage', vietnameseWord: 'nhà để xe' },
      { englishWord: 'balcony', vietnameseWord: 'ban công' },
      { englishWord: 'stairs', vietnameseWord: 'cầu thang' },
      { englishWord: 'door', vietnameseWord: 'cửa' },
    ],
  },
  {
    title: 'Thời gian và ngày tháng',
    description: 'Từ vựng về thời gian, ngày trong tuần và tháng trong năm',
    pairs: [
      { englishWord: 'today', vietnameseWord: 'hôm nay' },
      { englishWord: 'tomorrow', vietnameseWord: 'ngày mai' },
      { englishWord: 'yesterday', vietnameseWord: 'hôm qua' },
      { englishWord: 'morning', vietnameseWord: 'buổi sáng' },
      { englishWord: 'afternoon', vietnameseWord: 'buổi chiều' },
      { englishWord: 'evening', vietnameseWord: 'buổi tối' },
      { englishWord: 'night', vietnameseWord: 'đêm' },
      { englishWord: 'Monday', vietnameseWord: 'thứ hai' },
      { englishWord: 'Sunday', vietnameseWord: 'chủ nhật' },
      { englishWord: 'week', vietnameseWord: 'tuần' },
    ],
  },
  {
    title: 'Nghề nghiệp phổ biến',
    description: 'Học từ vựng về các nghề nghiệp thường gặp',
    pairs: [
      { englishWord: 'teacher', vietnameseWord: 'giáo viên' },
      { englishWord: 'doctor', vietnameseWord: 'bác sĩ' },
      { englishWord: 'nurse', vietnameseWord: 'y tá' },
      { englishWord: 'engineer', vietnameseWord: 'kỹ sư' },
      { englishWord: 'lawyer', vietnameseWord: 'luật sư' },
      { englishWord: 'police', vietnameseWord: 'cảnh sát' },
      { englishWord: 'farmer', vietnameseWord: 'nông dân' },
      { englishWord: 'chef', vietnameseWord: 'đầu bếp' },
      { englishWord: 'driver', vietnameseWord: 'tài xế' },
      { englishWord: 'student', vietnameseWord: 'học sinh/sinh viên' },
    ],
  },
  {
    title: 'Phương tiện giao thông',
    description: 'Từ vựng về các loại phương tiện di chuyển',
    pairs: [
      { englishWord: 'car', vietnameseWord: 'ô tô' },
      { englishWord: 'bus', vietnameseWord: 'xe buýt' },
      { englishWord: 'train', vietnameseWord: 'tàu hỏa' },
      { englishWord: 'plane', vietnameseWord: 'máy bay' },
      { englishWord: 'bicycle', vietnameseWord: 'xe đạp' },
      { englishWord: 'motorcycle', vietnameseWord: 'xe máy' },
      { englishWord: 'boat', vietnameseWord: 'thuyền' },
      { englishWord: 'ship', vietnameseWord: 'tàu thủy' },
      { englishWord: 'taxi', vietnameseWord: 'taxi' },
      { englishWord: 'truck', vietnameseWord: 'xe tải' },
    ],
  },
  {
    title: 'Cảm xúc và tính cách',
    description: 'Học từ vựng để diễn tả cảm xúc và tính cách',
    pairs: [
      { englishWord: 'happy', vietnameseWord: 'vui vẻ/hạnh phúc' },
      { englishWord: 'sad', vietnameseWord: 'buồn' },
      { englishWord: 'angry', vietnameseWord: 'giận dữ' },
      { englishWord: 'excited', vietnameseWord: 'phấn khích' },
      { englishWord: 'tired', vietnameseWord: 'mệt mỏi' },
      { englishWord: 'hungry', vietnameseWord: 'đói' },
      { englishWord: 'thirsty', vietnameseWord: 'khát' },
      { englishWord: 'kind', vietnameseWord: 'tốt bụng' },
      { englishWord: 'smart', vietnameseWord: 'thông minh' },
      { englishWord: 'funny', vietnameseWord: 'hài hước' },
    ],
  }
];

// Tạo sample exercise results để test
const sampleResults = [
  { score: 95, timeSpent: 120, attempts: 1 },
  { score: 88, timeSpent: 180, attempts: 2 },
  { score: 76, timeSpent: 240, attempts: 3 },
  { score: 92, timeSpent: 150, attempts: 1 },
  { score: 84, timeSpent: 200, attempts: 2 },
];

async function seedVocabularyExercises() {
  console.log('🌱 Starting to seed vocabulary exercises...');

  try {
    // Kiểm tra xem có user nào trong database không
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('⚠️  No users found in database. Creating a test user...');
      
      // Tạo test user để gán exercises
      const testUser = await prisma.user.create({
        data: {
          email: 'test@vocabulary.com',
          name: 'Test User',
          role: 'USER',
        },
      });
      
      console.log(`✅ Created test user: ${testUser.email}`);
    }

    // Lấy user đầu tiên để gán exercises
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      throw new Error('No user found to assign exercises to');
    }

    console.log(`👤 Using user: ${firstUser.email || firstUser.name || firstUser.id}`);

    // Xóa exercises cũ của user này để tránh duplicate
    await prisma.vocabularyExercise.deleteMany({
      where: { userId: firstUser.id }
    });

    console.log('🗑️  Cleaned up existing vocabulary exercises');

    let totalCreated = 0;
    let totalResultsCreated = 0;

    // Tạo từng exercise
    for (let i = 0; i < vocabularyExercisesData.length; i++) {
      const exerciseData = vocabularyExercisesData[i];
      
      console.log(`📚 Creating exercise: ${exerciseData.title}`);

      const exercise = await prisma.vocabularyExercise.create({
        data: {
          title: exerciseData.title,
          description: exerciseData.description,
          userId: firstUser.id,
          pairs: {
            create: exerciseData.pairs.map(pair => ({
              englishWord: pair.englishWord,
              vietnameseWord: pair.vietnameseWord,
            })),
          },
        },
        include: {
          pairs: true,
        },
      });

      totalCreated++;
      console.log(`✅ Created exercise "${exercise.title}" with ${exercise.pairs.length} word pairs`);

      // Tạo sample results cho một số exercises (ngẫu nhiên)
      if (Math.random() > 0.5) { // 50% chance có results
        const numResults = Math.floor(Math.random() * 3) + 1; // 1-3 results
        
        for (let j = 0; j < numResults; j++) {
          const resultData = sampleResults[Math.floor(Math.random() * sampleResults.length)];
          
          await prisma.exerciseResult.create({
            data: {
              userId: firstUser.id,
              exerciseId: exercise.id,
              score: resultData.score + Math.floor(Math.random() * 10) - 5, // Variation ±5
              timeSpent: resultData.timeSpent + Math.floor(Math.random() * 60) - 30, // Variation ±30s
              attempts: resultData.attempts,
              completedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random trong 7 ngày qua
            },
          });
          
          totalResultsCreated++;
        }
        
        console.log(`📊 Added ${numResults} sample results for "${exercise.title}"`);
      }

      // Delay nhỏ để tránh overwhelm database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Thống kê cuối cùng
    const totalExercises = await prisma.vocabularyExercise.count();
    const totalPairs = await prisma.vocabularyPair.count();
    const totalResults = await prisma.exerciseResult.count();

    console.log('🎉 Vocabulary seeding completed!');
    console.log(`📈 Statistics:`);
    console.log(`   - Exercises created: ${totalCreated}`);
    console.log(`   - Sample results created: ${totalResultsCreated}`);
    console.log(`   - Total exercises in DB: ${totalExercises}`);
    console.log(`   - Total word pairs in DB: ${totalPairs}`);
    console.log(`   - Total results in DB: ${totalResults}`);

  } catch (error) {
    console.error('💥 Error during vocabulary seeding:', error);
    throw error;
  }
}

// Chạy seed function
if (require.main === module) {
  seedVocabularyExercises()
    .then(() => {
      console.log('✨ Vocabulary seeding process finished successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Vocabulary seeding process failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedVocabularyExercises };