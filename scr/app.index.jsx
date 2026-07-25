import React, { useState } from 'react';
import { ShoppingCart, Star, LogOut, Package } from 'lucide-react';

export default function SkinMatchAI() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authData, setAuthData] = useState({ email: '', password: '', name: '', businessName: '' });
  const [isSignUp, setIsSignUp] = useState(false);
  const [analysisMode, setAnalysisMode] = useState(null);
  const [quizStep, setQuizStep] = useState(0);
  const [photoAnalysis, setPhotoAnalysis] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({
    sexe: '', age: '', typePeau: '', carnation: '', problemes: [], allergies: false
  });
  const [recommendations, setRecommendations] = useState(null);
  const [cart, setCart] = useState([]);
  const [allProducts, setAllProducts] = useState([
    { id: 1, name: 'Nettoyant purifiant', brand: 'BeautyBénin', price: 8500, skinType: 'Grasse', problem: 'Acné', rating: 4.8, reviews: 42, reason: 'Élimine l\'excès de sébum', vendor: 'BeautyBénin' },
    { id: 2, name: 'Crème hydratante riche', brand: 'LuxeSkin', price: 15000, skinType: 'Sèche', problem: 'Sécheresse', rating: 4.9, reviews: 67, reason: 'Nutrition intensive', vendor: 'LuxeSkin' },
    { id: 3, name: 'Sérum anti-acné', brand: 'ClearSkin', price: 13000, skinType: 'Grasse', problem: 'Acné', rating: 4.8, reviews: 54, reason: 'Réduit acné et cicatrices', vendor: 'ClearSkin' },
    { id: 4, name: 'SPF 50+ Protection', brand: 'SunGuard', price: 11500, skinType: 'Tous', problem: 'Protection', rating: 4.9, reviews: 112, reason: 'Protection UV maximale', vendor: 'SunGuard' },
  ]);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendorFormData, setVendorFormData] = useState({
    productName: '', brand: '', price: '', skinType: '', problem: '', reason: '', stock: ''
  });
  const [selectedTab, setSelectedTab] = useState('results');
  const [notifications, setNotifications] = useState([]);

  const quizQuestions = [
    { title: 'Quel est votre sexe ?', options: ['Femme', 'Homme', 'Autre'], key: 'sexe' },
    { title: 'Quel âge avez-vous ?', options: ['15-25', '25-35', '35-45', '45-55', '55+'], key: 'age' },
    { title: 'Quel est votre type de peau ?', options: ['Grasse', 'Sèche', 'Mixte', 'Normale', 'Sensible'], key: 'typePeau' },
    { title: 'Quelle est votre carnation ?', options: ['Très claire', 'Claire', 'Médium', 'Foncée', 'Très foncée'], key: 'carnation' },
    { title: 'Quel est votre principal problème ?', options: ['Acné', 'Rides', 'Taches', 'Peau terne', 'Boutons', 'Eczéma', 'Sensibilité', 'Aucun'], key: 'problemes', multiple: true },
  ];

  const handleAuth = (e) => {
    e.preventDefault();
    if (isSignUp) {
      if (!authData.name || !authData.email || !authData.password) return;
      setUser({ name: authData.name, email: authData.email });
      setUserRole('user');
    } else {
      if (!authData.email || !authData.password) return;
      setUser({ name: 'Utilisateur', email: authData.email });
      setUserRole('user');
    }
    setAuthData({ email: '', password: '', name: '', businessName: '' });
    setCurrentPage('mode');
  };

  const handleVendorSignUp = (e) => {
    e.preventDefault();
    if (!authData.businessName || !authData.email || !authData.password) return;
    setUser({ name: authData.businessName, email: authData.email });
    setUserRole('vendor');
    setAuthData({ email: '', password: '', name: '', businessName: '' });
    setCurrentPage('vendor-dashboard');
    addNotification('✅ Bienvenue ! Ajoutez vos premiers produits');
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    setCurrentPage('home');
    setCart([]);
    setRecommendations(null);
  };

  const addNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  const handleQuizAnswer = (answer) => {
    const question = quizQuestions[quizStep];
    if (question.multiple) {
      setQuizAnswers(prev => ({
        ...prev,
        [question.key]: prev[question.key].includes(answer)
          ? prev[question.key].filter(a => a !== answer)
          : [...prev[question.key], answer]
      }));
    } else {
      setQuizAnswers(prev => ({ ...prev, [question.key]: answer }));
      setQuizStep(quizStep + 1);
    }
  };

  const submitQuiz = () => {
    const question = quizQuestions[quizStep];
    if (question.multiple && quizAnswers[question.key].length === 0) return;
    if (!question.multiple && !quizAnswers[question.key]) return;
    
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      generateRecommendations();
    }
  };

  const generateRecommendations = () => {
    const skinTypeName = quizAnswers.typePeau;
    const problemName = quizAnswers.problemes[0] || 'Aucun';
    
    const matched = allProducts.filter(p => 
      (p.skinType === skinTypeName || p.skinType === 'Tous') &&
      (p.problem === problemName || p.problem === 'Protection')
    );

    setRecommendations({
      ...quizAnswers,
      matchedProducts: matched.length > 0 ? matched : allProducts.slice(0, 4),
      date: new Date().toLocaleDateString('fr-FR')
    });
    
    setCurrentPage('results');
  };

  const analyzePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTimeout(() => {
        const skinTypes = ['Grasse', 'Sèche', 'Mixte', 'Normale'];
        const conditions = ['Bonne condition', 'Légère irritation', 'Très bonne condition'];
        const problems = ['Acné', 'Taches', 'Rides', 'Boutons', 'Aucun'];

        setPhotoAnalysis({
          skinType: skinTypes[Math.floor(Math.random() * skinTypes.length)],
          condition: conditions[Math.floor(Math.random() * conditions.length)],
          problem: problems[Math.floor(Math.random() * problems.length)],
          hydration: Math.floor(Math.random() * 40 + 50) + '%'
        });
        
        setCurrentPage('photo-analysis');
      }, 1000);
    }
  };

  const proceedWithPhoto = () => {
    if (photoAnalysis) {
      setQuizAnswers(prev => ({
        ...prev,
        typePeau: photoAnalysis.skinType,
        problemes: [photoAnalysis.problem]
      }));
      setQuizStep(1);
      setCurrentPage('quiz');
    }
  };

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
    addNotification(`✅ ${product.name} ajouté au panier`);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter((_, i) => i !== productId));
  };

  const getCartTotal = () => cart.reduce((sum, p) => sum + p.price, 0);

  const addVendorProduct = (e) => {
    e.preventDefault();
    if (!vendorFormData.productName || !vendorFormData.price) return;
    
    const newProduct = {
      id: allProducts.length + 1,
      name: vendorFormData.productName,
      brand: vendorFormData.brand || user.name,
      price: parseInt(vendorFormData.price),
      skinType: vendorFormData.skinType || 'Tous',
      problem: vendorFormData.problem || 'Maintenance',
      reason: vendorFormData.reason || 'Excellent produit',
      rating: 4.7,
      reviews: 0,
      vendor: user.name
    };
    
    setAllProducts(prev => [...prev, newProduct]);
    setVendorProducts(prev => [...prev, newProduct]);
    setVendorFormData({ productName: '', brand: '', price: '', skinType: '', problem: '', reason: '', stock: '' });
    addNotification('✅ Produit ajouté avec succès !');
  };

  const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyle = 'px-6 py-3 rounded-lg font-semibold transition duration-300 cursor-pointer';
    const variants = {
      primary: 'bg-[#D4AF37] text-white hover:shadow-lg hover:bg-[#c9a530]',
      secondary: 'border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#FFF8DC]',
      ghost: 'text-gray-700 hover:bg-gray-100'
    };
    return <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>{children}</button>;
  };

  const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 ${className}`}>{children}</div>
  );

  const ProductCard = ({ product, onAdd, variant = 'default' }) => (
    <Card className="p-6 hover:shadow-md transition overflow-hidden">
      <div className="mb-4">
        <div className="inline-block bg-[#FFF8DC] px-3 py-1 rounded-full text-sm text-[#D4AF37] font-semibold">{product.skinType}</div>
      </div>
      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
      <p className="text-gray-600 text-sm mb-3">{product.brand}</p>
      <p className="text-sm text-gray-700 italic mb-4">💡 {product.reason}</p>
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-bold text-[#D4AF37]">{product.price.toLocaleString()} CFA</span>
        <div className="flex items-center gap-1 text-sm">
          <Star size={16} className="fill-[#D4AF37]" style={{color: '#D4AF37'}} />
          <span className="font-bold">{product.rating}</span>
          <span className="text-gray-600">({product.reviews})</span>
        </div>
      </div>
      {variant === 'default' && <Button onClick={() => onAdd(product)} className="w-full">Ajouter au panier</Button>}
    </Card>
  );

  if (currentPage === 'home' && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]"></div>
              <h1 className="text-2xl font-bold text-gray-900">SkinMatch AI</h1>
            </div>
            <div className="hidden md:flex gap-4">
              <Button variant="ghost" onClick={() => { setIsSignUp(true); setCurrentPage('auth'); }}>
                S'inscrire
              </Button>
              <Button onClick={() => { setIsSignUp(false); setCurrentPage('auth'); }}>
                Se connecter
              </Button>
            </div>
          </div>
        </header>

        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Trouvez enfin les produits parfaits pour votre peau
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Répondez à quelques questions ou analysez votre peau par photo. Notre IA recommande les produits cosmétiques parfaits pour vos besoins.
            </p>
            <Button onClick={() => { setIsSignUp(true); setCurrentPage('auth'); }} className="text-lg">
              Commencer gratuitement
            </Button>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {[
              { icon: '❓', title: 'Questionnaire', desc: '5 questions simples' },
              { icon: '📷', title: 'Analyse Photo', desc: 'Détection IA' },
              { icon: '📋', title: 'Routine Complète', desc: 'Matin et soir' },
              { icon: '🛒', title: 'Shop Intégré', desc: 'Achetez directement' }
            ].map((feature, i) => (
              <Card key={i} className="p-8 text-center hover:shadow-md transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-[#FFF8DC] border-t-2 border-[#D4AF37] py-12">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h3 className="text-2xl font-bold mb-4">Vous êtes une marque cosmétique ?</h3>
            <p className="text-gray-700 mb-6">Rejoignez notre plateforme et mettez vos produits en avant</p>
            <Button onClick={() => { setIsSignUp(true); setCurrentPage('vendor-auth'); }}>
              Devenir partenaire
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (currentPage === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]"></div>
              <h1 className="text-2xl font-bold">SkinMatch AI</h1>
            </div>
          </div>
        </header>

        <div className="max-w-md mx-auto mt-20 px-6">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">{isSignUp ? 'Créer un compte' : 'Se connecter'}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={authData.name}
                  onChange={(e) => setAuthData({...authData, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={authData.email}
                onChange={(e) => setAuthData({...authData, email: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={authData.password}
                onChange={(e) => setAuthData({...authData, password: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
              />
              <Button className="w-full text-lg">
                {isSignUp ? "S'inscrire" : 'Se connecter'}
              </Button>
            </form>
            <p className="text-center mt-6 text-gray-600">
              {isSignUp ? 'Vous avez déjà un compte ? ' : 'Pas de compte ? '}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-[#D4AF37] font-bold hover:underline">
                {isSignUp ? 'Se connecter' : "S'inscrire"}
              </button>
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (currentPage === 'vendor-auth') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]"></div>
              <h1 className="text-2xl font-bold">SkinMatch AI</h1>
            </div>
          </div>
        </header>

        <div className="max-w-md mx-auto mt-20 px-6">
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-2 text-center">Espace Vendeur</h2>
            <p className="text-center text-gray-600 mb-6">Créez votre compte partenaire</p>
            <form onSubmit={handleVendorSignUp} className="space-y-4">
              <input
                type="text"
                placeholder="Nom de votre marque"
                value={authData.businessName}
                onChange={(e) => setAuthData({...authData, businessName: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
              />
              <input
                type="email"
                placeholder="Email professionnel"
                value={authData.email}
                onChange={(e) => setAuthData({...authData, email: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={authData.password}
                onChange={(e) => setAuthData({...authData, password: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#D4AF37]"
              />
              <Button className="w-full text-lg">S'inscrire comme vendeur</Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  if (currentPage === 'mode' && user && userRole === 'user' && !analysisMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]"></div>
              <h1 className="text-xl font-bold">SkinMatch AI</h1>
            </div>
            <Button variant="ghost" onClick={logout}>Déconnexion</Button>
          </div>
        </header>

        <section className="max-w-4xl mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-center mb-4">Comment voulez-vous commencer ?</h2>
          <p className="text-center text-gray-600 mb-16">Choisissez la méthode qui vous convient</p>

          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-10 border-2 border-[#D4AF37] hover:shadow-lg transition">
              <div className="text-6xl mb-6">❓</div>
              <h3 className="text-2xl font-bold mb-4">Questionnaire rapide</h3>
              <p className="text-gray-600 mb-6">Répondez à 5 questions et recevez des recommandations en 2 minutes</p>
              <Button onClick={() => { setAnalysisMode('questionnaire'); setCurrentPage('quiz'); }} className="w-full">
                Commencer
              </Button>
            </Card>

            <Card className="p-10 border-2 border-[#D4AF37] hover:shadow-lg transition">
              <div className="text-6xl mb-6">📷</div>
              <h3 className="text-2xl font-bold mb-4">Analyse photo</h3>
              <p className="text-gray-600 mb-6">Prenez une selfie pour une analyse IA plus précise</p>
              <Button onClick={() => { setAnalysisMode('photo'); setCurrentPage('photo-upload'); }} className="w-full">
                Uploader photo
              </Button>
            </Card>
          </div>
        </section>
      </div>
    );
  }

  if (currentPage === 'photo-upload' && user && analysisMode === 'photo') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]"></div>
              <h1 className="text-xl font-bold">SkinMatch AI</h1>
            </div>
            <Button variant="ghost" onClick={logout}>Déconnexion</Button>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-6 py-20">
          <Card className="p-12 text-center">
            <div className="text-6xl mb-6">📷</div>
            <h2 className="text-3xl font-bold mb-4">Prenez une selfie</h2>
            <p className="text-gray-600 mb-8">Photo claire pour une analyse précise</p>
            <label className="inline-block">
              <input type="file" accept="image/*" onChange={analyzePhoto} className="hidden" />
              <div className="px-8 py-4 rounded-lg font-bold text-white bg-[#D4AF37] cursor-pointer hover:shadow-lg transition">
                Uploader une photo
              </div>
            </label>
          </Card>
        </div>
      </div>
    );
  }

  if (currentPage === 'photo-analysis' && photoAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]"></div>
              <h1 className="text-xl font-bold">SkinMatch AI</h1>
            </div>
            <Button variant="ghost" onClick={logout}>Déconnexion</Button>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-6 py-12">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-8">📊 Résultats</h2>
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-2">Type de peau</p>
                <p className="text-3xl font-bold text-[#D4AF37]">{photoAnalysis.skinType}</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-2">État</p>
                <p className="text-2xl font-bold">{photoAnalysis.condition}</p>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <Button onClick={proceedWithPhoto} className="w-full">
                Continuer
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (currentPage === 'quiz' && user && analysisMode) {
    const question = quizQuestions[quizStep];
    if (!question) return null;

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]"></div>
              <h1 className="text-xl font-bold">SkinMatch AI</h1>
            </div>
            <Button variant="ghost" onClick={logout}>Déconnexion</Button>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-[#D4AF37] h-2 rounded-full" style={{width: `${(quizStep + 1) / quizQuestions.length * 100}%`}}></div>
            </div>
          </div>

          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-8">{question.title}</h2>
            <div className="space-y-3 mb-8">
              {question.options.map(option => (
                <button
                  key={option}
                  onClick={() => handleQuizAnswer(option)}
                  className={`w-full p-4 border-2 rounded-lg text-left font-medium transition ${
                    (question.multiple ? quizAnswers[question.key].includes(option) : quizAnswers[question.key] === option)
                      ? 'border-[#D4AF37] bg-[#FFF8DC]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <Button onClick={submitQuiz} className="w-full">
              {quizStep === quizQuestions.length - 1 ? 'Résultats' : 'Suivant'}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (currentPage === 'results' && user && userRole === 'user' && recommendations) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]"></div>
              <h1 className="text-xl font-bold">SkinMatch AI</h1>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 bg-[#FFF8DC] px-4 py-2 rounded-lg">
                <ShoppingCart size={20} className="text-[#D4AF37]" />
                <span className="font-bold">{cart.length}</span>
              </div>
              <Button variant="ghost" onClick={logout}>Déconnexion</Button>
            </div>
          </div>
        </header>

        <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
          <div className="max-w-6xl mx-auto px-6 flex gap-8">
            {['results', 'shop', 'profile'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-4 border-b-2 font-medium transition ${selectedTab === tab ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-gray-600'}`}
              >
                {tab === 'results' && '📋 Résultats'} {tab === 'shop' && '🛒 Shop'} {tab === 'profile' && '👤 Profil'}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {selectedTab === 'results' && (
            <div className="space-y-8">
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Votre profil</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 mb-2">Type de peau</p>
                    <p className="text-2xl font-bold text-[#D4AF37]">{recommendations.typePeau}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-2">Problèmes</p>
                    <p className="text-lg font-bold">{recommendations.problemes.join(', ') || 'Aucun'}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Produits recommandés</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {recommendations.matchedProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAdd={addToCart} />
                  ))}
                </div>
              </Card>
            </div>
          )}

          {selectedTab === 'shop' && (
            <div>
              <h2 className="text-3xl font-bold mb-8">🛒 Boutique</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {allProducts.map(product => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} />
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'profile' && (
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8">
                <p className="text-gray-600 mb-2">Email</p>
                <p className="text-xl font-bold">{user.email}</p>
              </Card>

              <Card className="p-8">
                <h3 className="text-xl font-bold mb-6">Panier ({cart.length})</h3>
                {cart.length > 0 ? (
                  <div className="space-y-3">
                    {cart.map((product, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-bold">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.brand}</p>
                        </div>
                        <button onClick={() => removeFromCart(i)} className="text-red-600 text-sm">Supprimer</button>
                      </div>
                    ))}
                    <div className="border-t-2 border-[#D4AF37] pt-3 mt-3">
                      <span className="font-bold text-[#D4AF37]">{getCartTotal().toLocaleString()} CFA</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Vide</p>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentPage === 'vendor-dashboard' && user && userRole === 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]"></div>
              <h1 className="text-xl font-bold">{user.name}</h1>
            </div>
            <Button variant="ghost" onClick={logout}>Déconnexion</Button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">➕ Ajouter produit</h2>
              <form onSubmit={addVendorProduct} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nom du produit"
                  value={vendorFormData.productName}
                  onChange={(e) => setVendorFormData({...vendorFormData, productName: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Prix"
                  value={vendorFormData.price}
                  onChange={(e) => setVendorFormData({...vendorFormData, price: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"
                />
                <Button className="w-full">Ajouter</Button>
              </form>
            </Card>

            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">📦 Produits</h2>
              {vendorProducts.length > 0 ? (
                vendorProducts.map(p => (
                  <div key={p.id} className="p-4 bg-gray-50 rounded-lg mb-3">
                    <p className="font-bold">{p.name}</p>
                    <p className="text-[#D4AF37]">{p.price.toLocaleString()} CFA</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">Aucun produit</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
                                                 }
