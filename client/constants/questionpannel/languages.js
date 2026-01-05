export const languages = [
  { value: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { value: 'python', label: 'Python', monaco: 'python' },
  { value: 'java', label: 'Java', monaco: 'java' },
  { value: 'cpp', label: 'C++', monaco: 'cpp' },
  { value: 'c', label: 'C', monaco: 'c' },
  { value: 'typescript', label: 'TypeScript', monaco: 'typescript' },
];

export const defaultStarterCodes = {
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function solution(nums, target) {
  // Write your code here
  
  return [];
}`,
  python: `class Solution:
    def solution(self, nums: List[int], target: int) -> List[int]:
        # Write your code here
        
        pass`,
  java: `class Solution {
    public int[] solution(int[] nums, int target) {
        // Write your code here
        
        return new int[]{};
    }
}`,
  cpp: `class Solution {
public:
    vector<int> solution(vector<int>& nums, int target) {
        // Write your code here
        
        return {};
    }
};`,
  c: `/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* solution(int* nums, int numsSize, int target, int* returnSize) {
    // Write your code here
    
    return NULL;
}`,
  typescript: `function solution(nums: number[], target: number): number[] {
  // Write your code here
  
  return [];
}`,
};

export default languages;
