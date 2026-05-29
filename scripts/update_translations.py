#!/usr/bin/env python3
"""Script to add French and Arabic translations for help content."""
import re
import os

# French translations for help content
FR_TRANSLATIONS = {
    "Help Center": "Centre d'aide",
    "Help": "Aide",
    "Quick Start Guide": "Guide de démarrage rapide",
    "Getting Started": "Démarrage",
    "Learn the basics and create your first resume": "Apprenez les bases et créez votre premier CV",
    "Personal Information": "Informations personnelles",
    "Add your basic details and contact information": "Ajoutez vos coordonnées et informations de base",
    "Resume Sections": "Sections du CV",
    "Add experience, education, skills, and more": "Ajoutez expérience, formation, compétences et plus",
    "Experience & Internships": "Expérience et Stages",
    "Document your work history and practical training": "Documentez votre parcours professionnel et vos formations pratiques",
    "Education & Certifications": "Formation et Certifications",
    "Add your academic background and credentials": "Ajoutez votre parcours académique et vos diplômes",
    "Skills & Skill Presets": "Compétences et Préréglages",
    "Add professional skills with industry-specific presets": "Ajoutez des compétences avec des préréglages spécifiques à votre domaine",
    "AI Features": "Fonctionnalités IA",
    "Use artificial intelligence to improve your resume": "Utilisez l'intelligence artificielle pour améliorer votre CV",
    "Create a digital business card to share your contact info": "Créez une carte de visite numérique pour partager vos coordonnées",
    "Templates & Design": "Modèles et Design",
    "Customize how your resume looks": "Personnalisez l'apparence de votre CV",
    "Layout & Page Setup": "Mise en page",
    "Control page structure and section arrangement": "Contrôlez la structure et l'agencement des sections",
    "Exporting Your Resume": "Exporter votre CV",
    "Download your resume as PDF or JSON": "Téléchargez votre CV en PDF ou JSON",
    "Tips for Trade School Students": "Conseils pour les étudiants en formation professionnelle",
    "Special advice for IMTA students in healthcare and industry": "Conseils spéciaux pour les étudiants IMTA en santé et industrie",
    "Troubleshooting": "Dépannage",
    "Solutions to common problems": "Solutions aux problèmes courants",
    "Everything you need to know about using IMTA Resume Builder": "Tout ce que vous devez savoir sur le générateur de CV IMTA",
    "Search help topics...": "Rechercher dans l'aide...",
    "Create your professional resume in 5 simple steps:": "Créez votre CV professionnel en 5 étapes simples :",
    "Create an account and log in": "Créez un compte et connectez-vous",
    "Fill in your personal information, education, and experience": "Remplissez vos informations personnelles, formation et expérience",
    "Add skills using presets for your field (Healthcare, Industrial, HSE)": "Ajoutez des compétences avec les préréglages de votre domaine (Santé, Industriel, HSE)",
    "Choose a template and download your PDF": "Choisissez un modèle et téléchargez votre PDF",
    "Start Building Now": "Commencer maintenant",
    "Healthcare & Nursing": "Santé et Soins infirmiers",
    "Highlight patient care experience": "Mettez en valeur votre expérience en soins aux patients",
    "List all certifications (CPR, First Aid)": "Listez toutes vos certifications (RCP, Premiers secours)",
    "Mention hospital/clinic internships": "Mentionnez vos stages en hôpital/clinique",
    "Include soft skills (empathy, communication)": "Incluez les compétences interpersonnelles (empathie, communication)",
    "Industrial & Mechanical": "Industriel et Mécanique",
    "List equipment you can operate": "Listez les équipements que vous savez utiliser",
    "Include technical certifications": "Incluez vos certifications techniques",
    "Describe maintenance experience": "Décrivez votre expérience en maintenance",
    "Mention safety training completed": "Mentionnez les formations sécurité complétées",
    "HSE & Safety": "HSE et Sécurité",
    "Highlight safety certifications": "Mettez en valeur vos certifications sécurité",
    "Mention risk assessment experience": "Mentionnez votre expérience en évaluation des risques",
    "Include compliance knowledge": "Incluez vos connaissances en conformité",
    "Describe any training you've delivered": "Décrivez les formations que vous avez dispensées",
    "Still need help?": "Besoin d'aide supplémentaire ?",
    "Contact your IMTA administration for questions about your program, or explore more features in the app.": "Contactez l'administration IMTA pour les questions sur votre programme, ou explorez plus de fonctionnalités dans l'application.",
    "Visit IMTA Website": "Visiter le site IMTA",
    "Go to Dashboard": "Aller au tableau de bord",
    "Clear search": "Effacer la recherche",
    "What is IMTA Resume?": "Qu'est-ce qu'IMTA Resume ?",
    "How do I create an account?": "Comment créer un compte ?",
    "How do I start building my resume?": "Comment commencer à créer mon CV ?",
    "What information should I prepare before starting?": "Quelles informations préparer avant de commencer ?",
    "What goes in the Basics section?": "Que mettre dans la section Informations de base ?",
    "How do I add a profile photo?": "Comment ajouter une photo de profil ?",
    "What should I write as my headline?": "Que dois-je écrire comme titre professionnel ?",
    "Should I include my full address?": "Dois-je inclure mon adresse complète ?",
    "What sections should I include in my resume?": "Quelles sections inclure dans mon CV ?",
    "How do I add a new section?": "Comment ajouter une nouvelle section ?",
    "How do I reorder sections?": "Comment réorganiser les sections ?",
    "How do I hide a section temporarily?": "Comment masquer une section temporairement ?",
    "How do I add my internship experience?": "Comment ajouter mon expérience de stage ?",
    "What should I write in the description?": "Que dois-je écrire dans la description ?",
    "How do I format dates?": "Comment formater les dates ?",
    "How do I add my IMTA education?": "Comment ajouter ma formation IMTA ?",
    "How do I add certifications?": "Comment ajouter des certifications ?",
    "How do I highlight relevant coursework?": "Comment mettre en valeur les cours pertinents ?",
    "How do I add skills?": "Comment ajouter des compétences ?",
    "What are Skill Presets?": "Que sont les préréglages de compétences ?",
    "How do Healthcare/Nursing presets work?": "Comment fonctionnent les préréglages Santé/Soins infirmiers ?",
    "How do Industrial/Mechanical presets work?": "Comment fonctionnent les préréglages Industriel/Mécanique ?",
    "How do HSE/Safety presets work?": "Comment fonctionnent les préréglages HSE/Sécurité ?",
    "Can I modify preset skills?": "Puis-je modifier les compétences préréglées ?",
    "How do I enable AI features?": "Comment activer les fonctionnalités IA ?",
    "What can AI do for my resume?": "Que peut faire l'IA pour mon CV ?",
    "How do I use AI to generate a summary?": "Comment utiliser l'IA pour générer un résumé ?",
    "How do I use AI to improve text?": "Comment utiliser l'IA pour améliorer le texte ?",
    "How does AI Suggest Skills work?": "Comment fonctionne la suggestion de compétences par IA ?",
    "Is my data safe when using AI?": "Mes données sont-elles sécurisées avec l'IA ?",
    "What is the Business Card feature?": "Qu'est-ce que la fonction Carte de visite ?",
    "How do I enable my Business Card?": "Comment activer ma Carte de visite ?",
    "How do I customize my Business Card theme?": "Comment personnaliser le thème de ma Carte de visite ?",
    "What information appears on my Business Card?": "Quelles informations apparaissent sur ma Carte de visite ?",
    "How do I use the QR Code?": "Comment utiliser le code QR ?",
    "What is vCard?": "Qu'est-ce qu'une vCard ?",
    "How do I change my resume template?": "Comment changer de modèle de CV ?",
    "How many templates are available?": "Combien de modèles sont disponibles ?",
    "How do I change colors and fonts?": "Comment changer les couleurs et polices ?",
    "What fonts can I use?": "Quelles polices puis-je utiliser ?",
    "Can I add custom CSS?": "Puis-je ajouter du CSS personnalisé ?",
    "How do I change the page layout?": "Comment modifier la mise en page ?",
    "How do I set page margins and spacing?": "Comment définir les marges et espacements ?",
    "Can I have multiple pages?": "Puis-je avoir plusieurs pages ?",
    "How do I download my resume as PDF?": "Comment télécharger mon CV en PDF ?",
    "What is the JSON export for?": "À quoi sert l'export JSON ?",
    "Why is my PDF taking a long time?": "Pourquoi mon PDF prend-il du temps ?",
    "What file name will my PDF have?": "Quel sera le nom de mon fichier PDF ?",
    "How should nursing students highlight their skills?": "Comment les étudiants infirmiers doivent-ils mettre en valeur leurs compétences ?",
    "How should industrial students present their experience?": "Comment les étudiants industriels doivent-ils présenter leur expérience ?",
    "How do I describe internship experience professionally?": "Comment décrire mon expérience de stage de façon professionnelle ?",
    "Should I include my IMTA training details?": "Dois-je inclure les détails de ma formation IMTA ?",
    "How do I show certifications effectively?": "Comment présenter efficacement mes certifications ?",
    "What if I only have internship experience?": "Et si je n'ai que des stages ?",
    "AI features are not working.": "Les fonctionnalités IA ne fonctionnent pas.",
    "How do I contact support?": "Comment contacter le support ?",
}

# Arabic translations for help content
AR_TRANSLATIONS = {
    "Help Center": "مركز المساعدة",
    "Help": "مساعدة",
    "Quick Start Guide": "دليل البدء السريع",
    "Getting Started": "البدء",
    "Learn the basics and create your first resume": "تعلم الأساسيات وأنشئ سيرتك الذاتية الأولى",
    "Personal Information": "المعلومات الشخصية",
    "Add your basic details and contact information": "أضف بياناتك الأساسية ومعلومات الاتصال",
    "Resume Sections": "أقسام السيرة الذاتية",
    "Add experience, education, skills, and more": "أضف الخبرة والتعليم والمهارات والمزيد",
    "Experience & Internships": "الخبرة والتدريب العملي",
    "Document your work history and practical training": "وثق تاريخك المهني وتدريبك العملي",
    "Education & Certifications": "التعليم والشهادات",
    "Add your academic background and credentials": "أضف خلفيتك الأكاديمية ومؤهلاتك",
    "Skills & Skill Presets": "المهارات والإعدادات المسبقة",
    "Add professional skills with industry-specific presets": "أضف مهارات مهنية مع إعدادات مسبقة خاصة بمجالك",
    "AI Features": "ميزات الذكاء الاصطناعي",
    "Use artificial intelligence to improve your resume": "استخدم الذكاء الاصطناعي لتحسين سيرتك الذاتية",
    "Create a digital business card to share your contact info": "أنشئ بطاقة عمل رقمية لمشاركة معلومات الاتصال الخاصة بك",
    "Templates & Design": "القوالب والتصميم",
    "Customize how your resume looks": "خصص مظهر سيرتك الذاتية",
    "Layout & Page Setup": "التخطيط وإعداد الصفحة",
    "Control page structure and section arrangement": "تحكم في هيكل الصفحة وترتيب الأقسام",
    "Exporting Your Resume": "تصدير سيرتك الذاتية",
    "Download your resume as PDF or JSON": "حمل سيرتك الذاتية بصيغة PDF أو JSON",
    "Tips for Trade School Students": "نصائح لطلاب التكوين المهني",
    "Special advice for IMTA students in healthcare and industry": "نصائح خاصة لطلاب IMTA في الصحة والصناعة",
    "Troubleshooting": "استكشاف الأخطاء وإصلاحها",
    "Solutions to common problems": "حلول للمشاكل الشائعة",
    "Everything you need to know about using IMTA Resume Builder": "كل ما تحتاج معرفته حول استخدام منشئ السيرة الذاتية IMTA",
    "Search help topics...": "البحث في المساعدة...",
    "Create your professional resume in 5 simple steps:": "أنشئ سيرتك الذاتية المهنية في 5 خطوات بسيطة:",
    "Create an account and log in": "أنشئ حسابًا وسجل الدخول",
    "Fill in your personal information, education, and experience": "املأ معلوماتك الشخصية وتعليمك وخبرتك",
    "Add skills using presets for your field (Healthcare, Industrial, HSE)": "أضف مهارات باستخدام الإعدادات المسبقة لمجالك (الصحة، الصناعة، السلامة)",
    "Choose a template and download your PDF": "اختر قالبًا وحمل ملف PDF",
    "Start Building Now": "ابدأ الإنشاء الآن",
    "Healthcare & Nursing": "الصحة والتمريض",
    "Highlight patient care experience": "أبرز خبرتك في رعاية المرضى",
    "List all certifications (CPR, First Aid)": "اذكر جميع الشهادات (الإنعاش القلبي، الإسعافات الأولية)",
    "Mention hospital/clinic internships": "اذكر تدريباتك في المستشفيات/العيادات",
    "Include soft skills (empathy, communication)": "أضف المهارات الشخصية (التعاطف، التواصل)",
    "Industrial & Mechanical": "الصناعة والميكانيك",
    "List equipment you can operate": "اذكر المعدات التي تستطيع تشغيلها",
    "Include technical certifications": "أضف شهاداتك التقنية",
    "Describe maintenance experience": "صف خبرتك في الصيانة",
    "Mention safety training completed": "اذكر تدريبات السلامة المكتملة",
    "HSE & Safety": "الصحة والسلامة والبيئة",
    "Highlight safety certifications": "أبرز شهادات السلامة",
    "Mention risk assessment experience": "اذكر خبرتك في تقييم المخاطر",
    "Include compliance knowledge": "أضف معرفتك بالامتثال",
    "Describe any training you've delivered": "صف أي تدريب قدمته",
    "Still need help?": "هل تحتاج مزيدًا من المساعدة؟",
    "Contact your IMTA administration for questions about your program, or explore more features in the app.": "تواصل مع إدارة IMTA للأسئلة حول برنامجك، أو استكشف المزيد من الميزات في التطبيق.",
    "Visit IMTA Website": "زيارة موقع IMTA",
    "Go to Dashboard": "الذهاب إلى لوحة التحكم",
    "Clear search": "مسح البحث",
    "What is IMTA Resume?": "ما هو IMTA Resume؟",
    "How do I create an account?": "كيف أنشئ حسابًا؟",
    "How do I start building my resume?": "كيف أبدأ في إنشاء سيرتي الذاتية؟",
    "What information should I prepare before starting?": "ما المعلومات التي يجب تحضيرها قبل البدء؟",
    "What goes in the Basics section?": "ماذا أضع في قسم المعلومات الأساسية؟",
    "How do I add a profile photo?": "كيف أضيف صورة شخصية؟",
    "What should I write as my headline?": "ماذا أكتب كعنوان مهني؟",
    "Should I include my full address?": "هل أضمن عنواني الكامل؟",
    "What sections should I include in my resume?": "ما الأقسام التي يجب تضمينها في سيرتي الذاتية؟",
    "How do I add a new section?": "كيف أضيف قسمًا جديدًا؟",
    "How do I reorder sections?": "كيف أعيد ترتيب الأقسام؟",
    "How do I hide a section temporarily?": "كيف أخفي قسمًا مؤقتًا؟",
    "How do I add my internship experience?": "كيف أضيف خبرة التدريب العملي؟",
    "What should I write in the description?": "ماذا أكتب في الوصف؟",
    "How do I format dates?": "كيف أنسق التواريخ؟",
    "How do I add my IMTA education?": "كيف أضيف تعليمي في IMTA؟",
    "How do I add certifications?": "كيف أضيف الشهادات؟",
    "How do I highlight relevant coursework?": "كيف أبرز المقررات ذات الصلة؟",
    "How do I add skills?": "كيف أضيف المهارات؟",
    "What are Skill Presets?": "ما هي الإعدادات المسبقة للمهارات؟",
    "How do Healthcare/Nursing presets work?": "كيف تعمل إعدادات الصحة/التمريض؟",
    "How do Industrial/Mechanical presets work?": "كيف تعمل إعدادات الصناعة/الميكانيك؟",
    "How do HSE/Safety presets work?": "كيف تعمل إعدادات السلامة؟",
    "Can I modify preset skills?": "هل يمكنني تعديل المهارات المسبقة؟",
    "How do I enable AI features?": "كيف أفعل ميزات الذكاء الاصطناعي؟",
    "What can AI do for my resume?": "ماذا يمكن للذكاء الاصطناعي أن يفعل لسيرتي الذاتية؟",
    "How do I use AI to generate a summary?": "كيف أستخدم الذكاء الاصطناعي لإنشاء ملخص؟",
    "How do I use AI to improve text?": "كيف أستخدم الذكاء الاصطناعي لتحسين النص؟",
    "How does AI Suggest Skills work?": "كيف يعمل اقتراح المهارات بالذكاء الاصطناعي؟",
    "Is my data safe when using AI?": "هل بياناتي آمنة عند استخدام الذكاء الاصطناعي؟",
    "What is the Business Card feature?": "ما هي ميزة بطاقة العمل؟",
    "How do I enable my Business Card?": "كيف أفعل بطاقة العمل الخاصة بي؟",
    "How do I customize my Business Card theme?": "كيف أخصص مظهر بطاقة العمل؟",
    "What information appears on my Business Card?": "ما المعلومات التي تظهر على بطاقة العمل؟",
    "How do I use the QR Code?": "كيف أستخدم رمز QR؟",
    "What is vCard?": "ما هي vCard؟",
    "How do I change my resume template?": "كيف أغير قالب سيرتي الذاتية؟",
    "How many templates are available?": "كم عدد القوالب المتاحة؟",
    "How do I change colors and fonts?": "كيف أغير الألوان والخطوط؟",
    "What fonts can I use?": "ما الخطوط التي يمكنني استخدامها؟",
    "Can I add custom CSS?": "هل يمكنني إضافة CSS مخصص؟",
    "How do I change the page layout?": "كيف أغير تخطيط الصفحة؟",
    "How do I set page margins and spacing?": "كيف أضبط هوامش الصفحة والتباعد؟",
    "Can I have multiple pages?": "هل يمكنني الحصول على عدة صفحات؟",
    "How do I download my resume as PDF?": "كيف أحمل سيرتي الذاتية كـ PDF؟",
    "What is the JSON export for?": "ما هو غرض تصدير JSON؟",
    "Why is my PDF taking a long time?": "لماذا يستغرق PDF وقتًا طويلاً؟",
    "What file name will my PDF have?": "ما اسم ملف PDF؟",
    "How should nursing students highlight their skills?": "كيف يجب على طلاب التمريض إبراز مهاراتهم؟",
    "How should industrial students present their experience?": "كيف يجب على طلاب الصناعة تقديم خبرتهم؟",
    "How do I describe internship experience professionally?": "كيف أصف خبرة التدريب بشكل مهني؟",
    "Should I include my IMTA training details?": "هل أضمن تفاصيل تدريبي في IMTA؟",
    "How do I show certifications effectively?": "كيف أعرض الشهادات بفعالية؟",
    "What if I only have internship experience?": "ماذا لو كان لدي فقط خبرة تدريب؟",
    "AI features are not working.": "ميزات الذكاء الاصطناعي لا تعمل.",
    "How do I contact support?": "كيف أتواصل مع الدعم؟",
}


def update_po_file(filepath, translations):
    """Update a PO file with the given translations."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    updated = 0
    for msgid, msgstr in translations.items():
        # Escape special characters
        escaped_msgid = msgid.replace('\\', '\\\\').replace('"', '\\"')
        escaped_msgstr = msgstr.replace('\\', '\\\\').replace('"', '\\"')

        # Pattern to find msgid followed by empty msgstr
        pattern = rf'(msgid "{re.escape(escaped_msgid)}"\nmsgstr )""'
        replacement = rf'\g<1>"{escaped_msgstr}"'

        new_content, count = re.subn(pattern, replacement, content)
        if count > 0:
            content = new_content
            updated += count

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return updated


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    locales_dir = os.path.join(script_dir, '..', 'locales')

    # Update French translations
    fr_file = os.path.join(locales_dir, 'fr-FR.po')
    if os.path.exists(fr_file):
        updated = update_po_file(fr_file, FR_TRANSLATIONS)
        print(f"Updated {updated} French translations in fr-FR.po")
    else:
        print(f"French PO file not found: {fr_file}")

    # Update Arabic translations
    ar_file = os.path.join(locales_dir, 'ar-SA.po')
    if os.path.exists(ar_file):
        updated = update_po_file(ar_file, AR_TRANSLATIONS)
        print(f"Updated {updated} Arabic translations in ar-SA.po")
    else:
        print(f"Arabic PO file not found: {ar_file}")
