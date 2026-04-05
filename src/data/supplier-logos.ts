const BRANDFETCH = 'https://cdn.brandfetch.io'
const S = (domain: string) => `${BRANDFETCH}/${domain}/w/128/h/128`

// Local images in /public/suppliers/ take priority
const LOCAL: Record<string, string> = {
  'תנובה': '/suppliers/תנובה.jpeg',
  'שטראוס': '/suppliers/שטראוס.png',
  'אסם-נסטלה': '/suppliers/אסם-נסטלה.jpeg',
  'עלית': '/suppliers/עלית.png',
  'סנו': '/suppliers/סנו.png',
  'שסטוביץ': '/suppliers/שסטוביץ.jpeg',
  'טאצ׳': '/suppliers/טאצ׳.png',
}

const CDN: Record<string, string> = {
  // Major Israeli
  'דיפלומט': S('diplomat-global.com'),
  'טרה': S('tara.co.il'),
  'גד': S('gad-dairy.co.il'),
  'סוגת': S('sugat.co.il'),
  'סוגת בשרים': S('sugat.co.il'),
  'זוגלובק': S('zoglowek.co.il'),
  'אגרקסקו': S('agrexco.com'),
  'כרמית': S('carmit.co.il'),
  'הרדוף': S('harduf.co.il'),
  'מטרנה': S('materna.co.il'),

  // Bakeries
  'אנג׳ל': S('angel-bakeries.co.il'),
  'ברמן': S('bermangroup.co.il'),

  // Drinks
  'קוקה קולה': S('coca-cola.com'),
  'טמפו': S('tempo-group.com'),
  'פריגת': S('strauss-group.com'),
  'שטראוס מים': S('strauss-group.com'),

  // International
  'יוניליוור': S('unilever.com'),
  'P&G': S('pg.com'),
  'קימברלי קלארק': S('kimberly-clark.com'),
  'הנקל': S('henkel.com'),
  'נסטלה': S('nestle.com'),
  'היפ': S('hipp.com'),
}

export function getSupplierLogo(name: string): string | null {
  return LOCAL[name] ?? CDN[name] ?? null
}
