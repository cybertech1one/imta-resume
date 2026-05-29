#!/usr/bin/env python3
"""Apply Arabic translations to ar-SA.po file."""
import sys
import os

po_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'locales', 'ar-SA.po')

with open(po_path, 'r', encoding='utf-8') as f:
    content = f.read()

# All translations as (old_str, new_str) pairs
# Only replaces empty msgstr with the Arabic translation
replacements = [
    # Landing page hero
    ('msgid "100% Gratuit"\nmsgstr ""', 'msgid "100% Gratuit"\nmsgstr "مجاني 100%"'),
    ('msgid "Construis ton avenir"\nmsgstr ""', 'msgid "Construis ton avenir"\nmsgstr "ابنِ مستقبلك"'),
    ('msgid "professionnel"\nmsgstr ""', 'msgid "professionnel"\nmsgstr "المهني"'),
    ('msgid "Ton premier emploi"\nmsgstr ""', 'msgid "Ton premier emploi"\nmsgstr "وظيفتك الأولى"'),
    ('msgid "commence ici"\nmsgstr ""', 'msgid "commence ici"\nmsgstr "تبدأ من هنا"'),
    ('msgid "Commencer gratuitement"\nmsgstr ""', 'msgid "Commencer gratuitement"\nmsgstr "ابدأ مجاناً"'),
    ('msgid "Commencer"\nmsgstr ""', 'msgid "Commencer"\nmsgstr "ابدأ"'),
    ('msgid "Optimise ATS"\nmsgstr ""', 'msgid "Optimise ATS"\nmsgstr "متوافق مع ATS"'),
    ('msgid "IA Integree"\nmsgstr ""', 'msgid "IA Integree"\nmsgstr "ذكاء اصطناعي مدمج"'),
    ('msgid "IA integree"\nmsgstr ""', 'msgid "IA integree"\nmsgstr "ذكاء اصطناعي مدمج"'),
    ('msgid "35+ modeles"\nmsgstr ""', 'msgid "35+ modeles"\nmsgstr "35+ قالب"'),
    ('msgid "etudiants"\nmsgstr ""', 'msgid "etudiants"\nmsgstr "طالب"'),
    ('msgid "Voir les modeles"\nmsgstr ""', 'msgid "Voir les modeles"\nmsgstr "عرض القوالب"'),
    # Features
    ('msgid "CV Intelligent"\nmsgstr ""', 'msgid "CV Intelligent"\nmsgstr "سيرة ذاتية ذكية"'),
    ('msgid "Evaluation Competences"\nmsgstr ""', 'msgid "Evaluation Competences"\nmsgstr "تقييم المهارات"'),
    ('msgid "Optimisation ATS"\nmsgstr ""', 'msgid "Optimisation ATS"\nmsgstr "تحسين ATS"'),
    ('msgid "ATS Optimization"\nmsgstr ""', 'msgid "ATS Optimization"\nmsgstr "تحسين ATS"'),
    ('msgid "Career Coaching"\nmsgstr ""', 'msgid "Career Coaching"\nmsgstr "إرشاد مهني"'),
    ('msgid "Career Guidance"\nmsgstr ""', 'msgid "Career Guidance"\nmsgstr "إرشاد مهني"'),
    ('msgid "Coaching"\nmsgstr ""', 'msgid "Coaching"\nmsgstr "إرشاد"'),
    ('msgid "Interview Prep"\nmsgstr ""', 'msgid "Interview Prep"\nmsgstr "تحضير المقابلات"'),
    ('msgid "Interview Preparation"\nmsgstr ""', 'msgid "Interview Preparation"\nmsgstr "تحضير المقابلات"'),
    ('msgid "Job Listings"\nmsgstr ""', 'msgid "Job Listings"\nmsgstr "قائمة الوظائف"'),
    ('msgid "Job Offers"\nmsgstr ""', 'msgid "Job Offers"\nmsgstr "عروض العمل"'),
    ('msgid "Skills Assessment"\nmsgstr ""', 'msgid "Skills Assessment"\nmsgstr "تقييم المهارات"'),
    ('msgid "Free"\nmsgstr ""', 'msgid "Free"\nmsgstr "مجاني"'),
    ('msgid "Gratuit"\nmsgstr ""', 'msgid "Gratuit"\nmsgstr "مجاني"'),
    ('msgid "Professional"\nmsgstr ""', 'msgid "Professional"\nmsgstr "احترافي"'),
    ('msgid "Start"\nmsgstr ""', 'msgid "Start"\nmsgstr "ابدأ"'),
    ('msgid "Evaluation"\nmsgstr ""', 'msgid "Evaluation"\nmsgstr "تقييم"'),
    ('msgid "Preparation"\nmsgstr ""', 'msgid "Preparation"\nmsgstr "تحضير"'),
    ('msgid "Outils CV"\nmsgstr ""', 'msgid "Outils CV"\nmsgstr "أدوات السيرة الذاتية"'),
    ('msgid "Carriere"\nmsgstr ""', 'msgid "Carriere"\nmsgstr "المهنة"'),
    ('msgid "Entretien"\nmsgstr ""', 'msgid "Entretien"\nmsgstr "المقابلة"'),
    # Auth
    ('msgid "Full name"\nmsgstr ""', 'msgid "Full name"\nmsgstr "الاسم الكامل"'),
    ('msgid "Get Started"\nmsgstr ""', 'msgid "Get Started"\nmsgstr "ابدأ الآن"'),
    ('msgid "My Profile"\nmsgstr ""', 'msgid "My Profile"\nmsgstr "ملفي الشخصي"'),
    ('msgid "Create a Resume"\nmsgstr ""', 'msgid "Create a Resume"\nmsgstr "إنشاء سيرة ذاتية"'),
    ('msgid "Create account form"\nmsgstr ""', 'msgid "Create account form"\nmsgstr "نموذج إنشاء حساب"'),
    ('msgid "Sign in form"\nmsgstr ""', 'msgid "Sign in form"\nmsgstr "نموذج تسجيل الدخول"'),
    ('msgid "Email or username is required"\nmsgstr ""', 'msgid "Email or username is required"\nmsgstr "البريد الإلكتروني أو اسم المستخدم مطلوب"'),
    ('msgid "Email is required"\nmsgstr ""', 'msgid "Email is required"\nmsgstr "البريد الإلكتروني مطلوب"'),
    ('msgid "Password is required"\nmsgstr ""', 'msgid "Password is required"\nmsgstr "كلمة المرور مطلوبة"'),
    ('msgid "Password must be at least 6 characters"\nmsgstr ""', 'msgid "Password must be at least 6 characters"\nmsgstr "كلمة المرور يجب أن تكون 6 أحرف على الأقل"'),
    ('msgid "Password cannot exceed 64 characters"\nmsgstr ""', 'msgid "Password cannot exceed 64 characters"\nmsgstr "كلمة المرور لا يمكن أن تتجاوز 64 حرفاً"'),
    ('msgid "Name must be at least 3 characters"\nmsgstr ""', 'msgid "Name must be at least 3 characters"\nmsgstr "الاسم يجب أن يكون 3 أحرف على الأقل"'),
    ('msgid "Name cannot exceed 64 characters"\nmsgstr ""', 'msgid "Name cannot exceed 64 characters"\nmsgstr "الاسم لا يمكن أن يتجاوز 64 حرفاً"'),
    ('msgid "Username must be at least 3 characters"\nmsgstr ""', 'msgid "Username must be at least 3 characters"\nmsgstr "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"'),
    ('msgid "Username cannot exceed 64 characters"\nmsgstr ""', 'msgid "Username cannot exceed 64 characters"\nmsgstr "اسم المستخدم لا يمكن أن يتجاوز 64 حرفاً"'),
    ('msgid "Please enter a valid email address"\nmsgstr ""', 'msgid "Please enter a valid email address"\nmsgstr "الرجاء إدخال عنوان بريد إلكتروني صالح"'),
    ('msgid "Please select your program"\nmsgstr ""', 'msgid "Please select your program"\nmsgstr "الرجاء اختيار برنامجك"'),
    ('msgid "Program / Formation"\nmsgstr ""', 'msgid "Program / Formation"\nmsgstr "البرنامج / التكوين"'),
    ('msgid "Select your program"\nmsgstr ""', 'msgid "Select your program"\nmsgstr "اختر برنامجك"'),
    ('msgid "Hide password"\nmsgstr ""', 'msgid "Hide password"\nmsgstr "إخفاء كلمة المرور"'),
    ('msgid "Show password"\nmsgstr ""', 'msgid "Show password"\nmsgstr "إظهار كلمة المرور"'),
    ('msgid "Sign in with {0}"\nmsgstr ""', 'msgid "Sign in with {0}"\nmsgstr "تسجيل الدخول عبر {0}"'),
    ('msgid "Sign in with GitHub"\nmsgstr ""', 'msgid "Sign in with GitHub"\nmsgstr "تسجيل الدخول عبر GitHub"'),
    ('msgid "Sign in with Google"\nmsgstr ""', 'msgid "Sign in with Google"\nmsgstr "تسجيل الدخول عبر Google"'),
    ('msgid "Sign in with Passkey authentication"\nmsgstr ""', 'msgid "Sign in with Passkey authentication"\nmsgstr "تسجيل الدخول بمصادقة مفتاح المرور"'),
    ('msgid "Alternative authentication methods"\nmsgstr ""', 'msgid "Alternative authentication methods"\nmsgstr "طرق مصادقة بديلة"'),
    ('msgid "Backup code must be exactly 10 characters"\nmsgstr ""', 'msgid "Backup code must be exactly 10 characters"\nmsgstr "رمز النسخ الاحتياطي يجب أن يكون 10 أحرف بالضبط"'),
    ('msgid "An account with this email already exists. Please sign in instead."\nmsgstr ""', 'msgid "An account with this email already exists. Please sign in instead."\nmsgstr "يوجد حساب بهذا البريد الإلكتروني بالفعل. الرجاء تسجيل الدخول بدلاً من ذلك."'),
    # Navigation
    ('msgid "Fonctionnalites"\nmsgstr ""', 'msgid "Fonctionnalites"\nmsgstr "المميزات"'),
    ('msgid "Aide"\nmsgstr ""', 'msgid "Aide"\nmsgstr "مساعدة"'),
    ('msgid "Guide"\nmsgstr ""', 'msgid "Guide"\nmsgstr "دليل"'),
    ('msgid "IMTA"\nmsgstr ""', 'msgid "IMTA"\nmsgstr "IMTA"'),
    ('msgid "Menu"\nmsgstr ""', 'msgid "Menu"\nmsgstr "القائمة"'),
    ('msgid "Construis ta carriere"\nmsgstr ""', 'msgid "Construis ta carriere"\nmsgstr "ابنِ مسيرتك المهنية"'),
    # Dashboard / Common
    ('msgid "Retour"\nmsgstr ""', 'msgid "Retour"\nmsgstr "رجوع"'),
    ('msgid "Suivant"\nmsgstr ""', 'msgid "Suivant"\nmsgstr "التالي"'),
    ('msgid "reussite"\nmsgstr ""', 'msgid "reussite"\nmsgstr "النجاح"'),
    ('msgid "Creer mon CV maintenant"\nmsgstr ""', 'msgid "Creer mon CV maintenant"\nmsgstr "أنشئ سيرتي الذاتية الآن"'),
    ('msgid "Creer un CV"\nmsgstr ""', 'msgid "Creer un CV"\nmsgstr "إنشاء سيرة ذاتية"'),
    ('msgid "Inscription"\nmsgstr ""', 'msgid "Inscription"\nmsgstr "التسجيل"'),
    ('msgid "Creation CV"\nmsgstr ""', 'msgid "Creation CV"\nmsgstr "إنشاء السيرة الذاتية"'),
    ('msgid "Emploi"\nmsgstr ""', 'msgid "Emploi"\nmsgstr "التوظيف"'),
    ('msgid "Etudiants actifs"\nmsgstr ""', 'msgid "Etudiants actifs"\nmsgstr "طلاب نشطون"'),
    ('msgid "Modeles de CV"\nmsgstr ""', 'msgid "Modeles de CV"\nmsgstr "قوالب السيرة الذاتية"'),
    ('msgid "Taux de satisfaction"\nmsgstr ""', 'msgid "Taux de satisfaction"\nmsgstr "نسبة الرضا"'),
    ('msgid "CV crees"\nmsgstr ""', 'msgid "CV crees"\nmsgstr "سير ذاتية تم إنشاؤها"'),
    ('msgid "IMTA Resume en chiffres"\nmsgstr ""', 'msgid "IMTA Resume en chiffres"\nmsgstr "IMTA Resume بالأرقام"'),
    ('msgid "Maroc"\nmsgstr ""', 'msgid "Maroc"\nmsgstr "المغرب"'),
    ('msgid "Produit"\nmsgstr ""', 'msgid "Produit"\nmsgstr "المنتج"'),
    ('msgid "Tout ce dont vous avez besoin"\nmsgstr ""', 'msgid "Tout ce dont vous avez besoin"\nmsgstr "كل ما تحتاجه"'),
    ('msgid "Vos outils de"\nmsgstr ""', 'msgid "Vos outils de"\nmsgstr "أدواتكم نحو"'),
    ('msgid "Designs professionnels"\nmsgstr ""', 'msgid "Designs professionnels"\nmsgstr "تصاميم احترافية"'),
    ('msgid "Ils nous font confiance"\nmsgstr ""', 'msgid "Ils nous font confiance"\nmsgstr "يثقون بنا"'),
    ('msgid "Explore Programs"\nmsgstr ""', 'msgid "Explore Programs"\nmsgstr "استكشف البرامج"'),
    ('msgid "Visit IMTA.MA"\nmsgstr ""', 'msgid "Visit IMTA.MA"\nmsgstr "زيارة IMTA.MA"'),
    ('msgid "Why Choose IMTA Resume"\nmsgstr ""', 'msgid "Why Choose IMTA Resume"\nmsgstr "لماذا تختار IMTA Resume"'),
    ('msgid "Comment ca marche"\nmsgstr ""', 'msgid "Comment ca marche"\nmsgstr "كيف يعمل"'),
    ('msgid "Des questions ?"\nmsgstr ""', 'msgid "Des questions ?"\nmsgstr "لديك أسئلة؟"'),
    ('msgid "Tous droits reserves."\nmsgstr ""', 'msgid "Tous droits reserves."\nmsgstr "جميع الحقوق محفوظة."'),
    ('msgid "Aller au tableau de bord"\nmsgstr ""', 'msgid "Aller au tableau de bord"\nmsgstr "الذهاب إلى لوحة التحكم"'),
    ('msgid "Changer la langue"\nmsgstr ""', 'msgid "Changer la langue"\nmsgstr "تغيير اللغة"'),
    ('msgid "Contacter IMTA"\nmsgstr ""', 'msgid "Contacter IMTA"\nmsgstr "الاتصال بـ IMTA"'),
    ('msgid "Navigation principale"\nmsgstr ""', 'msgid "Navigation principale"\nmsgstr "التنقل الرئيسي"'),
    ('msgid "Site web IMTA"\nmsgstr ""', 'msgid "Site web IMTA"\nmsgstr "موقع IMTA"'),
    ('msgid "IMTA Resume - Accueil"\nmsgstr ""', 'msgid "IMTA Resume - Accueil"\nmsgstr "IMTA Resume - الرئيسية"'),
    ('msgid "Pret(e) a lancer ta carriere ?"\nmsgstr ""', 'msgid "Pret(e) a lancer ta carriere ?"\nmsgstr "مستعد(ة) لبدء مسيرتك المهنية؟"'),
    # French validation strings
    ('msgid "Doit contenir entre 6 et 64 caracteres"\nmsgstr ""', 'msgid "Doit contenir entre 6 et 64 caracteres"\nmsgstr "يجب أن تحتوي بين 6 و64 حرفاً"'),
    ('msgid "Uniquement des lettres minuscules, chiffres, points, tirets et underscores"\nmsgstr ""', 'msgid "Uniquement des lettres minuscules, chiffres, points, tirets et underscores"\nmsgstr "فقط أحرف صغيرة وأرقام ونقاط وشرطات وشرطات سفلية"'),
]

count = 0
for old, new in replacements:
    if old in content:
        content = content.replace(old, new, 1)
        count += 1

# Also handle strings with apostrophes that need special handling
apostrophe_replacements = [
    ("Temoignages d'etudiants", "شهادات الطلاب"),
    ("Guide d'utilisation", "دليل الاستخدام"),
    ("s'ouvre dans un nouvel onglet", "يفتح في تبويب جديد"),
    ("Nos diplomes sont recrutes par les leaders du marche", "خريجونا يتم توظيفهم من قبل رواد السوق"),
    ("Opportunites de carriere", "فرص مهنية"),
    ("Comment mes donnees sont-elles protegees ?", "كيف يتم حماية بياناتي؟"),
    ("Comment partager mon CV ?", "كيف أشارك سيرتي الذاتية؟"),
    ("De l'inscription a l'emploi", "من التسجيل إلى التوظيف"),
    ("IMTA Resume est-il vraiment gratuit ?", "هل IMTA Resume مجاني حقاً؟"),
    ("Puis-je exporter mon CV en PDF ?", "هل يمكنني تصدير سيرتي الذاتية بصيغة PDF؟"),
    ("Puis-je personnaliser les modeles ?", "هل يمكنني تخصيص القوالب؟"),
    ("Qu'est-ce qui differencie IMTA Resume des autres createurs de CV ?", "ما الذي يميز IMTA Resume عن منشئي السير الذاتية الآخرين؟"),
    ("Quatre etapes simples pour passer d'etudiant IMTA a professionnel en activite.", "أربع خطوات بسيطة للانتقال من طالب IMTA إلى محترف عامل."),
    ("IMTA Resume est-il disponible en plusieurs langues ?", "هل IMTA Resume متوفر بعدة لغات؟"),
    ("Gratuit, sans carte de credit, pour toujours.", "مجاني، بدون بطاقة ائتمان، إلى الأبد."),
    ("Demonstration de la creation d'un CV avec IMTA Resume", "عرض توضيحي لإنشاء سيرة ذاتية باستخدام IMTA Resume"),
    ("Evaluez vos competences et decouvrez les metiers qui vous correspondent.", "قيّم مهاراتك واكتشف المهن المناسبة لك."),
    ("Des centaines d'etudiants IMTA utilisent notre plateforme pour lancer leur carriere professionnelle.", "مئات طلاب IMTA يستخدمون منصتنا لبدء مسيرتهم المهنية."),
    ("Tu es etudiant(e) en soins infirmiers, soudure ou HSE ? On t'aide a creer ton CV, preparer tes entretiens et decrocher ton stage.", "هل أنت طالب(ة) في التمريض أو اللحام أو السلامة؟ نساعدك في إنشاء سيرتك الذاتية وتحضير مقابلاتك والحصول على تدريبك."),
    ("Explorez notre selection variee de modeles, chacun concu pour s'adapter a differents styles, metiers et personnalites. IMTA Resume propose actuellement plus de 35 modeles, avec d'autres a venir.", "استكشف مجموعتنا المتنوعة من القوالب، كل واحد مصمم ليناسب أنماطاً ومهناً وشخصيات مختلفة. يقدم IMTA Resume حالياً أكثر من 35 قالباً، مع المزيد قريباً."),
    # Feature descriptions
    ("Construisez votre CV avec l'aide de l'intelligence artificielle. Suggestions de contenu, mise en forme automatique et optimisation en temps reel.", "أنشئ سيرتك الذاتية بمساعدة الذكاء الاصطناعي. اقتراحات محتوى، تنسيق تلقائي وتحسين في الوقت الفعلي."),
    ("Entrainez-vous avec des simulations d'entretiens alimentees par l'IA. Recevez des retours detailles et ameliorez vos reponses.", "تدرّب مع محاكاة مقابلات مدعومة بالذكاء الاصطناعي. احصل على ملاحظات مفصلة وحسّن إجاباتك."),
    ("Beneficiez d'un accompagnement personnalise pour definir votre parcours professionnel et atteindre vos objectifs.", "استفد من إرشاد شخصي لتحديد مسارك المهني وتحقيق أهدافك."),
    ("Accedez a un tableau d'offres d'emploi provenant d'entreprises marocaines qui recrutent activement des diplomes IMTA.", "اطلع على لوحة عروض العمل من شركات مغربية تبحث بنشاط عن خريجي IMTA."),
    ("Evaluez vos competences techniques et comportementales. Identifiez vos forces et les domaines a ameliorer.", "قيّم مهاراتك التقنية والسلوكية. حدد نقاط قوتك والمجالات التي تحتاج تحسيناً."),
    ("Assurez-vous que votre CV passe les filtres automatiques des recruteurs. Analyse et recommandations en un clic.", "تأكد من اجتياز سيرتك الذاتية لفلاتر التوظيف الآلية. تحليل وتوصيات بنقرة واحدة."),
    ("Choisissez parmi 35+ modeles professionnels adaptes aux metiers techniques", "اختر من بين 35+ قالب احترافي مصمم للمهن التقنية"),
    ("Simulez un entretien avec un recruteur IA en soins infirmiers, soudure ou HSE", "حاكِ مقابلة مع مسؤول توظيف ذكاء اصطناعي في التمريض أو اللحام أو السلامة"),
    ("Recommandations basees sur votre filiere IMTA", "توصيات مبنية على تخصصك في IMTA"),
    ("Offres filtrees par region et specialite", "عروض مصفاة حسب المنطقة والتخصص"),
    ("Quiz interactifs adaptes a chaque programme", "اختبارات تفاعلية مخصصة لكل برنامج"),
    ("Score de compatibilite avec conseils d'amelioration", "نتيجة التوافق مع نصائح للتحسين"),
    # Process steps
    ("Creez votre compte gratuitement en quelques secondes avec votre email IMTA. Aucune carte de credit requise.", "أنشئ حسابك مجاناً في ثوانٍ باستخدام بريدك الإلكتروني في IMTA. لا حاجة لبطاقة ائتمان."),
    ("Choisissez parmi 35+ modeles professionnels et personnalisez-le avec l'aide de l'IA pour votre metier.", "اختر من بين 35+ قالب احترافي وخصّصه بمساعدة الذكاء الاصطناعي لمهنتك."),
    ("Entrainez-vous avec des simulations d'entretiens IA adaptees a votre filiere : infirmier, soudeur ou HSE.", "تدرّب مع محاكاة مقابلات ذكاء اصطناعي مخصصة لتخصصك: تمريض، لحام أو سلامة."),
    ("Postulez aux offres d'entreprises marocaines qui recrutent activement des diplomes IMTA. Decrochez votre stage !", "تقدم لعروض الشركات المغربية التي توظف بنشاط خريجي IMTA. احصل على تدريبك!"),
    # FAQ answers
    ("Oui ! IMTA Resume est entierement gratuit, sans couts caches, abonnements premium ni frais d'inscription. Il est open-source et restera toujours gratuit.", "نعم! IMTA Resume مجاني بالكامل، بدون تكاليف مخفية أو اشتراكات مدفوعة أو رسوم تسجيل. إنه مفتوح المصدر وسيبقى مجانياً دائماً."),
    ("Vos donnees sont stockees de maniere securisee et ne sont jamais partagees avec des tiers. Vous avez un controle total sur vos informations personnelles.", "بياناتك مخزنة بشكل آمن ولا تتم مشاركتها مع أطراف ثالثة أبداً. لديك تحكم كامل في معلوماتك الشخصية."),
    ("Absolument ! Vous pouvez exporter votre CV en PDF en un seul clic. Le PDF exporte conserve parfaitement toute votre mise en forme et votre style.", "بالطبع! يمكنك تصدير سيرتك الذاتية بصيغة PDF بنقرة واحدة. يحافظ ملف PDF المصدّر على جميع التنسيقات والأنماط بشكل مثالي."),
    ("IMTA Resume est open-source, respectueux de la vie privee et entierement gratuit. Contrairement aux autres createurs de CV, il n'affiche pas de publicites, ne suit pas vos donnees et ne limite pas les fonctionnalites derriere un paywall.", "IMTA Resume مفتوح المصدر، يحترم الخصوصية ومجاني بالكامل. على عكس منشئي السير الذاتية الآخرين، لا يعرض إعلانات ولا يتتبع بياناتك ولا يقيّد الميزات خلف حاجز مدفوع."),
    ("Oui ! Chaque modele est entierement personnalisable. Vous pouvez modifier les couleurs, les polices, l'espacement et meme ecrire du CSS personnalise pour un controle total de l'apparence de votre CV.", "نعم! كل قالب قابل للتخصيص بالكامل. يمكنك تعديل الألوان والخطوط والتباعد وحتى كتابة CSS مخصص للتحكم الكامل في مظهر سيرتك الذاتية."),
    ("Vous pouvez partager votre CV via une URL publique unique, le proteger avec un mot de passe ou le telecharger en PDF pour le partager directement. Le choix vous appartient !", "يمكنك مشاركة سيرتك الذاتية عبر رابط عام فريد، أو حمايتها بكلمة مرور، أو تحميلها بصيغة PDF لمشاركتها مباشرة. الخيار لك!"),
    ("Le nom d'utilisateur ne peut contenir que des lettres minuscules, chiffres, points, tirets et underscores.", "اسم المستخدم يمكن أن يحتوي فقط على أحرف صغيرة وأرقام ونقاط وشرطات وشرطات سفلية."),
]

for msgid_str, msgstr_str in apostrophe_replacements:
    old = f'msgid "{msgid_str}"\nmsgstr ""'
    new = f'msgid "{msgid_str}"\nmsgstr "{msgstr_str}"'
    if old in content:
        content = content.replace(old, new, 1)
        count += 1

with open(po_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Successfully applied {count} translations')
