
export const  textToRegex = (searchText: string, matchCase:boolean): RegExp => {
  const normalizedSearchText = matchCase ? searchText : searchText.toLowerCase();
  const flags = matchCase ? "" : "i"; // 'g' 플래그 제거
  return new RegExp(`\\b${escapeRegExp(normalizedSearchText)}\\b`, flags);
}

export const findText =(regex:RegExp, text:string)=>{
  if(!text) return false; 

  const normalizedText = normalizeText(text);

  // 정규식 검색 - 첫 번째 매칭만
  const match = regex.exec(normalizedText);
  if (match) {
    return {
      start: match.index,
      end: match.index + match[0].length,
    };
  }
  return false; 
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeText(text: string) {
  return text.toLowerCase().replace(/\s+/g, ''); // 소문자 + 공백 제거
}

