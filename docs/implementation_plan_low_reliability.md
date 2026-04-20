# Goal Description

The user wants to add a new feature to the report screen that displays the specific answers flagged as "low reliability" along with clear explanations for why they reduced the test's trust score. This section will only be visible to HR personnel and will be hidden from printed reports (`print:hidden`) to protect sensitive analysis data.

## Proposed Changes

### `src/server/actions/getFlaggedAnswersAction.ts`
[NEW]
- Create a new server action `getFlaggedAnswers(recordId: string)`.
- It will query the specific assessment record to retrieve `answers` and `answerTimes`.
- It will fetch the questions for the related `questionSetId`.
- It will iterate through the answers and flag:
  - **Lie Scale Issues (Tô hồng tích cực):** Answers $\ge$ 4 on questions where `questionType` is `lie_absolute` or `lie_subtle`.
  - **Speed Issues (Trả lời quá nhanh):** Questions where the time taken is $<$ 1.5 seconds, suggesting random guessing.
- Output: An array of structured objects containing the question text, the user's selected answer, the type of flag, and a human-readable reason.

### `src/app/result/[id]/page.tsx`
[MODIFY]
- Fetch the flagged answers by calling `getFlaggedAnswers(record.id)`.
- Pass the newly fetched `flaggedAnswers` array down as a prop to the `ResultView` component.

### `src/features/assessment/components/ResultView.tsx`
[MODIFY]
- Update the component signature to accept the `flaggedAnswers` prop.
- Pass this prop down into the `ScouterReport` component where the detailed metrics are rendered.

### `src/features/assessment/components/ScouterReport.tsx`
[MODIFY]
- Update the `ScouterReport` props to accept `flaggedAnswers`.
- Locate **Section 1: Validation - ĐỘ TIN CẬY DỮ LIỆU**.
- Append a new `print:hidden` alert boundary right beneath the reliability metrics.
- The UI will render the list of flagged questions, the exact score chosen by the candidate, and the reason (e.g., "Câu hỏi kiểm tra độ trung thực bị đánh giá điểm cao", "Trả lời quá nhanh (1.2s)"). 

## Open Questions
- Is 1500ms (1.5s) an appropriate threshold for "Quick Answer" warnings? (This can be tuned).
- Do you want to include "Extreme responders" (answering 1 or 5) for regular questions, or just explicitly focus on Lie scale / Speed?

## Verification Plan
### Manual Verification
1. I will load the report screen for an existing user.
2. I will verify that the new HR Low Reliability Alert block correctly identifies any Lie scale questions they answered 4 or 5 on.
3. I will test `Ctrl+P` (Print) to guarantee this block is completely hidden in the PDF export.
