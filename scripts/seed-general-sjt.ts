import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding General SJT & Extreme Questions...');

  const qSet = await prisma.questionSet.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  if (!qSet) {
    console.error('No active QuestionSet found!');
    return;
  }

  // Xóa các câu SJT & FORCED_CHOICE cũ để thay bằng format Đa Ngành mới
  const deleted = await prisma.question.deleteMany({
    where: {
      setId: qSet.id,
      format: { in: ['SJT', 'FORCED_CHOICE', 'sjt', 'forced_choice'] }
    }
  });
  console.log(`Deleted ${deleted.count} old SJT / Extreme questions.`);

  const dims = await prisma.dimension.findMany();
  
  const getDim = (key: string) => {
    const d = dims.find(x => x.id === key || x.id.includes(key));
    return d ? d.id : (dims[0]?.id || 'unknown');
  };

  const dimC = getDim('conscientiousness');
  const dimAgree = getDim('agreeableness');
  const dimO = getDim('openness');
  const dimAchieve = getDim('achievement_drive');
  const dimSocial = getDim('social_contribution') || dimAgree;

  const newQs = [
    {
      setId: qSet.id,
      dimensionId: dimC,
      textVi: 'Chỉ còn 2 giờ là đến deadline nộp báo cáo quan trọng nhất quý. Bạn bất ngờ phát hiện một lỗi nhỏ không ảnh hưởng lớn kết quả, nhưng nếu sửa sẽ trễ deadline ít nhất 1 ngày. Bạn sẽ làm gì?',
      format: 'SJT',
      options: [
        { id: 'a', text: 'Lờ đi lỗi đó và nộp đúng hạn. Deadline là tối thượng, lỗi đó sẽ không ai phát hiện ra.', points: 1 },
        { id: 'b', text: 'Nộp đúng hạn, nhưng đính kèm báo cáo có lưu ý về lỗi nhỏ đang được khắc phục ở bản sau.', points: 4 },
        { id: 'c', text: 'Rút lại báo cáo, xin sếp dời deadline 1 ngày để khắc phục triệt để rồi mới nộp.', points: 5 },
        { id: 'd', text: 'Lập tức làm thâu đêm tự sửa lỗi, nộp trễ và chấp nhận chịu phạt không kêu ca.', points: 3 }
      ],
      displayOrder: 133,
    },
    {
      setId: qSet.id,
      dimensionId: dimAgree,
      textVi: 'Trong cuộc họp lớn, một đồng nghiệp cố tình thuyết trình nhận công lao về dự án do bạn làm ra và được sếp khen ngợi. Bạn sẽ làm gì?',
      format: 'SJT',
      options: [
        { id: 'a', text: 'Lập tức ngắt lời đính chính, đưa ra bằng chứng bảo vệ mình ngay trong cuộc họp.', points: 1 },
        { id: 'b', text: 'Mỉm cười im lặng. Họp xong mới hẹn gặp sếp để đưa bằng chứng riêng.', points: 3 },
        { id: 'c', text: 'Chen ngang khéo léo: "Nối tiếp ý tưởng mà tôi và bạn A vừa bàn..." để lấy lại vị thế.', points: 4 },
        { id: 'd', text: 'Bỏ qua, để đồng nghiệp nhận thưởng. Miễn là cả team được đánh giá cao.', points: 5 }
      ],
      displayOrder: 134,
    },
    {
      setId: qSet.id,
      dimensionId: dimO,
      textVi: 'Dự án bạn làm ngày đêm suốt 3 tuần vừa trình lên đã bị Công ty hủy bỏ đột ngột do đổi chiến lược. Phản ứng của bạn là:',
      format: 'SJT',
      options: [
        { id: 'a', text: 'Thất vọng, xin nghỉ phép vài ngày để cân bằng lại rồi mới làm tiếp.', points: 1 },
        { id: 'b', text: 'Cãi lý với sếp, cố thuyết phục giữ lại 1 phần dự án vì tiếc công sức.', points: 2 },
        { id: 'c', text: 'Đóng gói lưu trữ tài liệu cũ thật nhanh rồi xin brief làm dự án mới.', points: 4 },
        { id: 'd', text: 'Lập tức quên sạch dự án cũ, cực kỳ hào hứng học cái mới ngay.', points: 5 }
      ],
      displayOrder: 135,
    },
    {
      setId: qSet.id,
      dimensionId: dimAchieve,
      textVi: 'Bạn bị giao một công việc vượt quá khả năng chuyên môn, làm 3 ngày liên tục thất bại bế tắc. Bạn sẽ xử lý thế nào?',
      format: 'SJT',
      options: [
        { id: 'a', text: 'Tự nhốt mình cày thâu đêm tự học tới lúc làm được mới thôi.', points: 5 },
        { id: 'b', text: 'Trả lại task, chỉ rõ rủi ro thất bại cho sếp và xin từ chối sớm.', points: 2 },
        { id: 'c', text: 'Mời cafe đồng nghiệp/chuyên gia để nhờ cầm tay chỉ việc.', points: 4 },
        { id: 'd', text: 'Tầm tạm nộp kết quả, mảng trái nghề nên hỏng không phải lỗi của bạn.', points: 1 }
      ],
      displayOrder: 136,
    },

    // 4 Extreme Questions
    {
      setId: qSet.id,
      dimensionId: dimAgree, 
      textVi: 'Công ty sắp rớt KPI. Bạn buộc phải CHỌN giữ lại 1 trong 2 Leader dưới quyền:',
      format: 'FORCED_CHOICE',
      questionType: 'lie_absolute',
      options: [
        { id: 'a', text: 'Người mang doanh thu gấp 3 lần bình thường, nhưng hống hách, phá hoại văn hóa team.', points: 1 },
        { id: 'b', text: 'Người kết quả trung bình, nhưng tuân thủ luật lệ tuyệt đối, đoàn kết anh em xuất sắc.', points: 5 }
      ],
      displayOrder: 137,
    },
    {
      setId: qSet.id,
      dimensionId: dimC,
      textVi: 'Mẫu nhân viên nào khiến bạn trân trọng hơn với tư cách một quản lý?',
      format: 'FORCED_CHOICE',
      questionType: 'lie_absolute',
      options: [
        { id: 'a', text: 'Luôn trễ giờ làm/họp, nhưng lúc quan trọng tự giác thâu đêm cứu dự án bằng mọi giá.', points: 1 },
        { id: 'b', text: 'Chuẩn mực 100% đúng giờ, nhưng 17:00 tắt máy đi về từ chối mọi support ngoài giờ.', points: 5 }
      ],
      displayOrder: 138,
    },
    {
      setId: qSet.id,
      dimensionId: dimSocial,
      textVi: 'Đối thủ đang lôi kéo Trưởng Phòng của bạn. Nếu sếp đi, bạn vô tình biết mình sẽ được thăng chức lên thay. Bạn sẽ:',
      format: 'FORCED_CHOICE',
      questionType: 'lie_absolute',
      options: [
        { id: 'a', text: 'Im lặng. Đây là quyền lợi của sếp và cơ hội vàng để bạn thành Trưởng Phòng.', points: 1 },
        { id: 'b', text: 'Mật báo ngay cho Ban Giám Đốc để giữ chân sếp, bảo vệ lõi nhân sự cho công ty.', points: 5 }
      ],
      displayOrder: 139,
    },
    {
      setId: qSet.id,
      dimensionId: dimC,
      textVi: 'Sếp Tổng bị ép buộc tung ra sản phẩm lỗi nghiêm trọng gây hại cho khách hàng. Ông ra lệnh bạn im lặng để không bị vạ lây.',
      format: 'FORCED_CHOICE',
      questionType: 'lie_absolute',
      options: [
        { id: 'a', text: 'Trung thành tuyệt đối và làm theo. Không thể phản bội ân nhân.', points: 1 },
        { id: 'b', text: 'Vượt cấp cảnh báo bảo vệ KH, dẫu biết chắc ngày mai sẽ bị Sếp đuổi việc.', points: 5 }
      ],
      displayOrder: 140,
    }
  ];

  for (const q of newQs) {
    await prisma.question.create({
      data: q
    });
  }
  console.log(`Successfully added 8 General SJT & Extreme questions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
