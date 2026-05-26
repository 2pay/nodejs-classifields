function redirectBack(req, res) {
    res.redirect(req.get('Referrer') || '/');
}

exports.lang_en = function(req, res, next) {
    res.cookie('language', 'en', { maxAge: 900000, httpOnly: true });
    redirectBack(req, res);
};

exports.lang_vi = function(req, res, next) {
    res.cookie('language', 'vi', { maxAge: 900000, httpOnly: true });
    redirectBack(req, res);
};

exports.lang_zh = function(req, res, next) {
    res.cookie('language', 'zh', { maxAge: 900000, httpOnly: true });
    redirectBack(req, res);
};

exports.lang_ko = function(req, res, next) {
    res.cookie('language', 'ko', { maxAge: 900000, httpOnly: true });
    redirectBack(req, res);
};

exports.lang_ja = function(req, res, next) {
    res.cookie('language', 'ja', { maxAge: 900000, httpOnly: true });
    redirectBack(req, res);
};

exports.index = function(req, res, next) {
    res.render('frontend/home/index', {
        pageTitle: 'AI Video Prompt Templates',
        pageClass: 'vp-home-shell',
        bodyClass: 'vp-home-page',
        heroStats: [
            { value: '1,240+', label: 'Curated prompts' },
            { value: '38k+', label: 'Creator saves' },
            { value: '12', label: 'AI video tools' }
        ],
        resourceStats: [
            {
                value: '1,240+',
                label: 'Prompt templates',
                detail: 'Reusable structures for ads, stories, scenes, products, and social content.'
            },
            {
                value: '320+',
                label: 'Resource packs',
                detail: 'Prompt variables, camera moves, lighting recipes, style references, and tool notes.'
            },
            {
                value: '12',
                label: 'Supported AI tools',
                detail: 'Templates mapped for Runway, Kling, Veo, Pika, Luma, and other video generators.'
            },
            {
                value: '18k+',
                label: 'Creator members',
                detail: 'Video creators, marketers, editors, designers, and prompt authors sharing workflows.'
            }
        ],
        promptTemplates: [
            {
                title: 'Cinematic Product Reveal',
                category: 'Product Ads',
                badge: 'Trending',
                tool: 'Runway, Kling, Veo',
                duration: '8s vertical',
                author: 'Maya Chen',
                initial: 'M',
                authorRole: 'Brand video director',
                saves: '8.7k',
                rating: '4.9',
                variables: 'product, surface, camera move, lighting',
                preview: 'A premium product rises through soft mist on a reflective black surface, macro lens, slow dolly in, dramatic rim light, high-end commercial look.'
            },
            {
                title: 'AI Character Walk Cycle',
                category: 'Character',
                badge: 'Pro',
                tool: 'Pika, Luma, Runway',
                duration: '5s loop',
                author: 'Jin Park',
                initial: 'J',
                authorRole: 'Animation prompt designer',
                saves: '5.1k',
                rating: '4.8',
                variables: 'character, outfit, location, motion style',
                preview: 'A stylized character walks through a neon-lit alley, consistent face, natural arm swing, cinematic depth of field, seamless loop.'
            },
            {
                title: 'Real Estate Drone Intro',
                category: 'Real Estate',
                badge: 'Free',
                tool: 'Veo, Kling, Luma',
                duration: '10s widescreen',
                author: 'Alex Morgan',
                initial: 'A',
                authorRole: 'Property media creator',
                saves: '3.9k',
                rating: '4.7',
                variables: 'property type, location, time of day, camera path',
                preview: 'A smooth aerial approach toward a modern luxury villa at golden hour, cinematic drone movement, warm reflections, premium listing video.'
            }
        ],
        categories: [
            { name: 'Product Videos', count: 186, accent: 'cyan' },
            { name: 'Cinematic Scenes', count: 212, accent: 'green' },
            { name: 'Social Ads', count: 154, accent: 'amber' },
            { name: 'Character Motion', count: 97, accent: 'pink' },
            { name: 'Real Estate', count: 68, accent: 'blue' },
            { name: 'Music Videos', count: 83, accent: 'violet' }
        ],
        creators: [
            { name: 'Maya Chen', initial: 'M', title: 'Commercial director', prompts: 42, saves: '12.4k' },
            { name: 'Jin Park', initial: 'J', title: 'Animation designer', prompts: 31, saves: '9.8k' },
            { name: 'Sofia Rivera', initial: 'S', title: 'Social ads strategist', prompts: 27, saves: '7.2k' }
        ],
        trendingPrompts: [
            { title: 'Luxury perfume macro shot', tool: 'Runway', category: 'Product Ads', saves: '2.1k' },
            { title: 'Anime opening camera push', tool: 'Pika', category: 'Character', saves: '1.8k' },
            { title: 'Fashion runway recap', tool: 'Kling', category: 'Fashion', saves: '1.6k' },
            { title: 'Restaurant hero video', tool: 'Veo', category: 'Local Ads', saves: '1.2k' }
        ]
    });
};
