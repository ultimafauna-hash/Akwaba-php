import { Article, Event, Author, CulturePost } from './types';

// Custom lightweight frontmatter parser for browser compatibility 
function parseMatter(text: string) {
  const match = text.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) return { data: {}, content: text };
  
  const yaml = match[1];
  const content = text.slice(match[0].length).trim();
  const data: Record<string, any> = {};
  
  yaml.split('\n').forEach((line: string) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim()
        .replace(/^['"](.*)['"]$/, '$1'); // Remove quotes
      
      // Simple type conversion
      if (value === 'true') data[key] = true;
      else if (value === 'false') data[key] = false;
      else if (!isNaN(Number(value)) && value !== '') data[key] = Number(value);
      else data[key] = value;
    }
  });
  
  return { data, content };
}

// Import all markdown files from the articles directory recursively
const articleFiles = import.meta.glob('./articles/**/*.md', { 
  query: '?raw', 
  eager: true,
  import: 'default'
}) as Record<string, string>;

const eventFiles = import.meta.glob('./evenements/**/*.md', { 
  query: '?raw', 
  eager: true,
  import: 'default'
}) as Record<string, string>;

if (Object.keys(articleFiles).length === 0) {
  console.warn("No articles found via import.meta.glob. Check your file structure.");
}

export const MOCK_ARTICLES: Article[] = Object.entries(articleFiles).map(([path, content], index) => {
  try {
    const rawContent = typeof content === 'string' ? content : (content as any).default || '';
    const { data, content: body } = parseMatter(rawContent);
    const slug = path.split('/').pop()?.replace('.md', '') || `article-${index}`;
    
    return {
      id: slug,
      slug,
      title: data.title || 'Sans titre',
      date: data.date || new Date().toISOString(),
      category: data.category || 'Afrique',
      image: data.image || undefined,
      video: data.video || undefined,
      author: data.author || 'Rédaction',
      authorrole: data.authorrole || data.authorRole || 'Journaliste',
      excerpt: data.excerpt || '',
      content: body || '',
      readingtime: data.readingtime || data.readingTime || '2 min',
      views: data.views || 0,
      likes: data.likes || 0,
      commentscount: data.commentscount || data.commentsCount || 0,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split(',').map(t => t.trim()) : []),
      status: data.status || 'published',
      scheduledat: data.scheduledat || data.scheduledAt || null,
      audiourl: data.audiourl || data.audioUrl || '',
      gallery: data.gallery || [],
      source: data.source || '',
      imagecredit: data.imagecredit || data.imageCredit || '',
    } as Article;
  } catch (error) {
    console.error(`Error parsing article at ${path}:`, error);
    return null;
  }
}).filter((a): a is Article => a !== null).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const MOCK_AUTHORS: Author[] = [
  {
    id: '1',
    name: 'Koffi Benjamin',
    role: 'Rédacteur en Chef',
    bio: 'Passionné par les dynamiques socio-politiques en Afrique de l\'Ouest, Koffi couvre l\'actualité régionale depuis plus de 15 ans. Basé à Abidjan, il s\'attache à décrypter les enjeux complexes de la sous-région avec une approche analytique et rigoureuse.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&h=300&auto=format&fit=crop',
    socials: {
      twitter: 'https://twitter.com/koffiben',
      linkedin: 'https://linkedin.com/in/koffibenjamin',
      mail: 'koffi@akwabainfo.com'
    },
    specialties: ['Politique', 'Économie', 'Afrique']
  },
  {
    id: '2',
    name: 'Marie-Noëlle Traoré',
    role: 'Grand Reporter',
    bio: 'Journaliste d\'investigation spécialisée dans les questions environnementales et technologiques. Marie-Noëlle parcourt le continent pour mettre en lumière les innovations locales et les défis du changement climatique.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&h=300&auto=format&fit=crop',
    socials: {
      twitter: 'https://twitter.com/mn_traore',
      instagram: 'https://instagram.com/mn_traore_pics',
      mail: 'marie.noelle@akwabainfo.com'
    },
    specialties: ['Tech', 'Science', 'Écologie']
  },
  {
    id: '3',
    name: 'Jean-Luc Kouadio',
    role: 'Chroniqueur Sportif',
    bio: 'Ancien athlète devenu voix incontournable du sport ivoirien. Jean-Luc analyse les performances, les transferts et l\'économie du sport avec une passion communicative et un regard expert sur le football africain.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&h=300&auto=format&fit=crop',
    socials: {
      twitter: 'https://twitter.com/jlk_sport',
      facebook: 'https://facebook.com/jlk.kouadio',
      mail: 'jean-luc@akwabainfo.com'
    },
    specialties: ['Sport', 'Culture', 'Santé']
  },
  {
    id: '4',
    name: 'Awa Diabaté',
    role: 'Analyste Économique',
    bio: 'Spécialiste des marchés émergents et de l\'intégration régionale. Awa apporte une lecture claire des enjeux de la ZLECAf et des transformations structurelles des économies africaines.',
    image: 'https://images.unsplash.com/photo-1567532939604-b6c5b0ad2e01?q=80&w=300&h=300&auto=format&fit=crop',
    socials: {
      linkedin: 'https://linkedin.com/in/awa-diabate',
      twitter: 'https://twitter.com/awa_economie',
      mail: 'awa@akwabainfo.com'
    },
    specialties: ['Économie', 'Politique', 'Monde']
  }
];

export const MOCK_EVENTS: Event[] = Object.entries(eventFiles).map(([path, content], index) => {
  try {
    const rawContent = typeof content === 'string' ? content : (content as any).default || '';
    const { data, content: body } = parseMatter(rawContent);
    const slug = path.split('/').pop()?.replace('.md', '') || `event-${index}`;
    
    return {
      id: slug,
      slug,
      title: data.title || 'Sans titre',
      date: data.date || new Date().toISOString(),
      location: data.location || 'Lieu à préciser',
      category: data.category || 'Événement',
      image: data.image || undefined,
      video: data.video || undefined,
      excerpt: data.excerpt || '',
      content: body || '',
      status: data.status || 'published',
      scheduledat: data.scheduledat || data.scheduledAt || null,
      gallery: data.gallery || [],
      imagecredit: data.imagecredit || data.imageCredit || '',
    } as Event;
  } catch (error) {
    console.error(`Error parsing event at ${path}:`, error);
    return null;
  }
}).filter((e): e is Event => e !== null).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

export const MOCK_CULTURE: CulturePost[] = [
  {
    id: 'culture-1',
    slug: 'les-royaumes-du-benin',
    title: 'Les Royaumes du Bénin : Splendeurs de l\'Art de Cour',
    date: new Date().toISOString(),
    category: 'patrimoine',
    image: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=1200&auto=format&fit=crop',
    excerpt: 'Découvrez l\'histoire fascinante des bronzes du Bénin et la structure sociale complexe de l\'un des plus puissants empires d\'Afrique de l\'Ouest.',
    content: '# L\'Empire du Bénin\n\nL\'Empire du Bénin était un État précolonial situé dans l\'actuel sud du Nigeria. Il ne doit pas être confondu avec l\'État moderne du Bénin.\n\n## L\'Art du Bronze\nLes célèbres bronzes du Bénin constituent une collection de plus de mille plaques et sculptures métalliques qui décoraient le palais royal de l\'Oba.',
    author: 'Équipe Akwaba Info',
    period: 'XIIIe - XIXe siècle',
    region: 'Afrique de l\'Ouest',
    readingtime: '5 min',
    views: 1240,
    likes: 345,
    status: 'published',
    createdat: new Date().toISOString()
  },
  {
    id: 'culture-2',
    slug: 'le-festin-ivoirien',
    title: 'Gastronomie Ivoirienne : Le Tour du Pays en Saveurs',
    date: new Date().toISOString(),
    category: 'gastronomie',
    image: 'https://images.unsplash.com/photo-1604328701705-7f9a239b360b?q=80&w=1200&auto=format&fit=crop',
    excerpt: 'De l\'Attiéké-Poisson au Garba, explorez la richesse culinaire de la Côte d\'Ivoire et les secrets de fabrication du Plali.',
    content: '# La cuisine Ivoirienne\n\nLa cuisine de Côte d\'Ivoire est l\'une des plus variées d\'Afrique de l\'Ouest. Elle se base principalement sur les tubercules et les céréales.',
    author: 'Marie-Noëlle Traoré',
    period: 'Contemporain',
    region: 'Côte d\'Ivoire',
    readingtime: '4 min',
    views: 2100,
    likes: 850,
    status: 'published',
    createdat: new Date().toISOString()
  }
];
