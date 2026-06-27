import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

// Lista estática de volumes (01 a 81) + PS (ID 82)
const volumesList = Array.from({ length: 81 }, (_, i) => {
  const num = i + 1;
  return {
    id: String(num),
    label: String(num).padStart(2, '0')
  };
}).concat({ id: '82', label: ' PS ' });

const volumeTitles = {
  "1": "THE DEATH AND THE STRAWBERRY",
  "2": "GOODBYE PARAKEET, GOODNITE MY SISTA",
  "3": "MEMORIES IN THE RAIN",
  "4": "QUINCY ARCHER HATES YOU",
  "5": "RIGHTARM OF THE GIANT",
  "6": "THE DEATH TRILOGY OVERTURE",
  "7": "THE BROKEN CODA",
  "8": "THE BLADE AND ME",
  "9": "FOURTEEN DAYS FOR CONSPIRACY",
  "10": "TATTOO ON THE SKY",
  "11": "A STAR AND A STRAY DOG",
  "12": "FLOWER ON THE PRECIPICE",
  "13": "THE UNDEAD",
  "14": "WHITE TOWER ROCKS",
  "15": "BEGINNING OF THE DEATH OF TOMORROW",
  "16": "NIGHT OF WIJNRUIT",
  "17": "ROSA RUBICUNDIOR, LILIO CANDIDIOR",
  "18": "THE DEATHBERRY RETURNS",
  "19": "THE BLACK MOON RISING",
  "20": "END OF HYPNOSIS",
  "21": "BE MY FAMILY OR NOT",
  "22": "CONQUISTADORES",
  "23": "¡MALA SUERTE!",
  "24": "IMMANENT GOD BLUES",
  "25": "NO SHAKING THRONE",
  "26": "THE MASCARON DRIVE",
  "27": "GOODBYE, HALCYON DAYS.",
  "28": "BARON'S LECTURE FULL-COURSE",
  "29": "THE SLASHING OPERA",
  "30": "THERE IS NO HEART WITHOUT YOU",
  "31": "DON'T KILL MY VOLUPTURE",
  "32": "HOWLING",
  "33": "THE BAD JOKE",
  "34": "KING OF THE KILL",
  "35": "HIGHER THAN THE MOON",
  "36": "TURN BACK THE PENDULUM",
  "37": "BEAUTY IS SO SOLITARY",
  "38": "FEAR FOR FIGHT",
  "39": "EL VERDUGO",
  "40": "THE LUST",
  "41": "HEART",
  "42": "SHOCK OF THE QUEEN",
  "43": "KINGDOM OF HOLLOWS",
  "44": "VICE IT",
  "45": "THE BURNOUT INFERNO",
  "46": "BACK FROM BLIND",
  "47": "END OF THE CHRYSALIS AGE",
  "48": "GOD IS DEAD",
  "49": "THE LOST AGENT",
  "50": "THE SIX FULLBRINGERS",
  "51": "LOVE ME BITTERLY, LOTH ME SWEETLY",
  "52": "END OF BOND",
  "53": "THE DEATHBERRY RETURNS 2",
  "54": "GOODBYE TO OUR XCUTION",
  "55": "THE BLOOD WARFARE",
  "56": "MARCH OF THE STARCROSS",
  "57": "OUT OF BLOOM",
  "58": "THE FIRE",
  "59": "THE BATTLE",
  "60": "EVERYTHING BUT THE RAIN",
  "61": "THE LAST 9 DAYS",
  "62": "HEART OF WOLF",
  "63": "HEAR, FEAR, HERE",
  "64": "DEATH IN VISION",
  "65": "MARCHING OUT THE ZOMBIES",
  "66": "SORRY I AM STRONG",
  "67": "BLACK",
  "68": "THE ORDINARY PEACE",
  "69": "AGAINST THE JUDGEMENT",
  "70": "FRIEND",
  "71": "BABY, HOLD YOUR HAND",
  "72": "MY LAST WORDS",
  "73": "BATTLE FIELD",
  "74": "THE DEATH AND THE STRAWBERRY"
};

const getVolumeLabel = (id) => {
  const paddedNum = String(id).padStart(2, '0');
  const title = volumeTitles[String(id)];
  if (String(id) === '82') {
    return 'Volume PS';
  }
  if (title) {
    return `Volume ${paddedNum} — ${title}`;
  }
  return `Volume ${paddedNum}`;
};

function App() {
  const [randomPoem, setRandomPoem] = useState(null);
  const [livePoem, setLivePoem] = useState(null);
  const [livePoemObj, setLivePoemObj] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [newPoem, setNewPoem] = useState({ content: '', author_name: '', content_jp: '', content_ro: '', content_en: '', content_pt: '' });
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Alternador de visualização
  const [visibleCharCount, setVisibleCharCount] = useState(0); // Controle de opacidade dos caracteres
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Controle do menu mobile
  const [selectedLang, setSelectedLang] = useState('EN'); // Idioma selecionado no modo leitura
  const [availableIds, setAvailableIds] = useState([]); // IDs de poemas disponíveis no backend
  const [isHome, setIsHome] = useState(true); // Indica se estamos na página inicial (home)
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('adminToken') || '');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPassword, setAuthPassword] = useState('');

  const toggleTheme = () => {
    setIsDarkTheme((prev) => {
      const nextTheme = !prev;
      localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
      return nextTheme;
    });
  };

  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState({
    username: localStorage.getItem('username') || '',
    content: ''
  });
  const [latestComments, setLatestComments] = useState([]);
  const [likedComments, setLikedComments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('likedComments')) || [];
    } catch {
      return [];
    }
  });

  const fetchComments = (id) => {
    fetch(`${API_BASE}/api/poem/${id}/comments`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setComments(data);
        }
      })
      .catch((err) => console.warn('Erro ao carregar comentários:', err));
  };

  const fetchLatestComments = () => {
    if (!adminToken) return;
    fetch(`${API_BASE}/api/comments/latest`, {
      headers: { 'Authorization': adminToken }
    })
      .then((res) => {
        if (res.status === 401) {
          handleAdminLogout();
          throw new Error('Acesso não autorizado');
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setLatestComments(data);
        }
      })
      .catch((err) => console.warn('Erro ao carregar comentários para moderação:', err));
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentForm.username.trim() || !commentForm.content.trim()) {
      showStatus('error', 'Nome e comentário são obrigatórios!');
      return;
    }
    if (!randomPoem) return;

    fetch(`${API_BASE}/api/poem/${randomPoem.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentForm),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 201) {
          showStatus('success', 'Comentário enviado!');
          localStorage.setItem('username', commentForm.username);
          setCommentForm({ username: commentForm.username, content: '' });
          fetchComments(randomPoem.id);
        } else if (res.status === 429) {
          showStatus('error', 'Aguarde antes de comentar novamente.');
        } else {
          showStatus('error', data.error || 'Falha ao enviar comentário.');
        }
      })
      .catch((err) => {
        console.error(err);
        showStatus('error', 'Erro ao conectar ao servidor.');
      });
  };

  const handleLikeComment = (commentId) => {
    if (likedComments.includes(commentId)) return;

    fetch(`${API_BASE}/api/comment/${commentId}/like`, { method: 'POST' })
      .then((res) => {
        if (res.ok) {
          const nextLiked = [...likedComments, commentId];
          setLikedComments(nextLiked);
          localStorage.setItem('likedComments', JSON.stringify(nextLiked));
          if (randomPoem) {
            fetchComments(randomPoem.id);
          }
        }
      })
      .catch((err) => console.warn('Erro ao curtir comentário:', err));
  };

  const handleDeleteComment = (commentId) => {
    if (!window.confirm('Deseja realmente excluir este comentário?')) return;

    fetch(`${API_BASE}/api/comment/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': adminToken }
    })
      .then((res) => {
        if (res.status === 401) {
          handleAdminLogout();
          return;
        }
        if (res.ok) {
          showStatus('success', 'Comentário excluído!');
          fetchLatestComments();
          if (randomPoem) {
            fetchComments(randomPoem.id);
          }
        } else {
          showStatus('error', 'Falha ao excluir comentário.');
        }
      })
      .catch((err) => {
        console.error(err);
        showStatus('error', 'Erro ao conectar ao servidor.');
      });
  };

  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      if (adminToken) {
        setIsAdmin(true);
      } else {
        setShowAuthModal(true);
      }
    }
  };

  const handleVerifyPassword = (e) => {
    e.preventDefault();
    if (!authPassword.trim()) return;

    fetch(`${API_BASE}/api/admin/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: authPassword })
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          setAdminToken(data.token);
          sessionStorage.setItem('adminToken', data.token);
          setIsAdmin(true);
          setShowAuthModal(false);
          setAuthPassword('');
          showStatus('success', 'Acesso administrativo autorizado!');
        } else {
          showStatus('error', data.error || 'Senha incorreta.');
        }
      })
      .catch((err) => {
        console.error(err);
        showStatus('error', 'Erro ao conectar ao servidor.');
      });
  };

  const handleAdminLogout = () => {
    setAdminToken('');
    sessionStorage.removeItem('adminToken');
    setIsAdmin(false);
    showStatus('error', 'Sessão administrativa encerrada.');
  };

  // Efeito para carregar os comentários de moderação ao entrar no painel admin
  useEffect(() => {
    if (isAdmin) {
      fetchLatestComments();
    }
  }, [isAdmin]);

  const lastScrollTimeRef = useRef(0);
  const touchStartYRef = useRef(0);
  const currentPoemIdRef = useRef(null);
  const lastTrackedPoemIdRef = useRef(null);

  // Efeito de revelação gradual por opacidade (Ink-Fade Reveal) com pausas de respiração
  useEffect(() => {
    if (!randomPoem) return;
    
    // Determina o texto de acordo com o idioma selecionado
    let targetContent = randomPoem.content;
    if (selectedLang === 'JP' && randomPoem.content_jp) {
      targetContent = randomPoem.content_jp;
    } else if (selectedLang === 'RO' && randomPoem.content_ro) {
      targetContent = randomPoem.content_ro;
    } else if (selectedLang === 'EN' && randomPoem.content_en) {
      targetContent = randomPoem.content_en;
    } else if (selectedLang === 'PT' && randomPoem.content_pt) {
      targetContent = randomPoem.content_pt;
    }

    const lines = targetContent.split('\n');
    setVisibleCharCount(0);
    
    let timer;
    let currentLine = 0;
    let currentChar = 0;
    let absoluteCount = 0;
    
    const revealNextChar = () => {
      if (currentLine >= lines.length) return;
      
      const lineText = lines[currentLine];
      
      if (currentChar < lineText.length) {
        currentChar++;
        absoluteCount++;
        setVisibleCharCount(absoluteCount);
        const speed = selectedLang === 'JP' ? 140 : 50; // Mais lento para Kanjis
        timer = setTimeout(revealNextChar, speed);
      } else {
        // Fim da linha: faz uma pausa dramática de respiração (800ms) antes da próxima
        currentLine++;
        currentChar = 0;
        absoluteCount++; // Incrementa 1 para o caractere de newline '\n'
        
        if (currentLine < lines.length) {
          timer = setTimeout(() => {
            setVisibleCharCount(absoluteCount); // Libera o newline
            revealNextChar();
          }, 800);
        }
      }
    };
    
    timer = setTimeout(revealNextChar, 100);
    
    return () => clearTimeout(timer);
  }, [randomPoem, selectedLang]);

  // 1. Carrega dados iniciais e configura polling
  useEffect(() => {
    // Busca os IDs disponíveis primeiro
    fetch(`${API_BASE}/api/poems/ids`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ids) {
          const ids = data.ids.map(String);
          setAvailableIds(ids);
        }
      })
      .catch((err) => console.error('Erro ao buscar IDs disponíveis:', err));

    // Carrega o poema inicial com base no hash
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      if (initialHash === 'admin') {
        setIsHome(true);
        if (sessionStorage.getItem('adminToken')) {
          setIsAdmin(true);
        } else {
          setShowAuthModal(true);
        }
      } else {
        fetchPoemById(initialHash);
        setIsHome(false);
      }
    } else {
      setIsHome(true);
    }

    fetchRanking();

    // Busca o Poema do Dia inicialmente para o painel
    fetch(`${API_BASE}/poem/day`)
      .then((res) => res.json())
      .then((data) => {
        if (data.poem) {
          setLivePoem(data.poem);
        }
        if (data.data) {
          setLivePoemObj(data.data);
        }
      })
      .catch((err) => console.warn('Erro ao carregar poema do dia:', err.message || err));

    const rankingInterval = setInterval(fetchRanking, 5000);

    const sseSource = new EventSource(`${API_BASE}/poem/live`);
    
    sseSource.addEventListener('new_poem', (event) => {
      console.log('🔴 SSE Novo Poema Recebido (Atualizando Poema do Dia):', event.data);

      // Se for notificação de novo comentário
      if (event.data.startsWith('CommentCreated:')) {
        const pId = event.data.split(':')[1];
        if (currentPoemIdRef.current === pId) {
          fetchComments(pId);
        }
        if (isAdmin) {
          fetchLatestComments();
        }
        return;
      }
      // Recarrega o Poema do Dia pois o total de poemas mudou ou o dia virou
      fetch(`${API_BASE}/poem/day`)
        .then((res) => res.json())
        .then((data) => {
          if (data.poem) {
            setLivePoem(data.poem);
          }
          if (data.data) {
            setLivePoemObj(data.data);
          }
        })
        .catch((err) => console.warn('Erro ao recarregar poema do dia no SSE:', err.message || err));
      
      const liveCard = document.getElementById('live-feed-card');
      if (liveCard) {
        liveCard.classList.add('flash-glow');
        setTimeout(() => liveCard.classList.remove('flash-glow'), 1000);
      }
      fetchRanking();

      // Recarrega os IDs disponíveis em tempo real se um novo poema for publicado
      fetch(`${API_BASE}/api/poems/ids`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ids) {
            setAvailableIds(data.ids.map(String));
          }
        })
        .catch((err) => console.warn('Erro ao atualizar IDs no SSE:', err.message || err));
    });

    sseSource.onerror = (err) => {
      console.warn('Conexão SSE perdida (reconectando)...');
    };

    return () => {
      clearInterval(rankingInterval);
      sseSource.close();
    };
  }, []);

  // 2. Escuta mudanças de hash (botões voltar/avançar do navegador)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        if (hash === 'admin') {
          setIsHome(true);
          if (adminToken) {
            setIsAdmin(true);
          } else {
            setShowAuthModal(true);
          }
        } else {
          if (currentPoemIdRef.current !== hash) {
            fetchPoemById(hash);
          }
          setIsHome(false);
        }
      } else {
        // Se a hash for vazia, significa que voltamos para a Home!
        setIsHome(true);
        setRandomPoem(null);
        currentPoemIdRef.current = null;
        setIsCommentsOpen(false);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [adminToken]);

  // Auto-scroll para centralizar o item de volume selecionado na barra lateral (navbar/sidebar)
  useEffect(() => {
    if (!randomPoem) return;
    const timer = setTimeout(() => {
      const activeElements = document.querySelectorAll('.index p.active');
      activeElements.forEach((el) => {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [randomPoem]);

  // Garante que o idioma selecionado é válido para o poema atual ao trocar de poema
  useEffect(() => {
    if (!randomPoem) return;
    
    const hasLangContent = (lang) => {
      if (lang === 'JP') return !!randomPoem.content_jp;
      if (lang === 'RO') return !!randomPoem.content_ro;
      if (lang === 'EN') return !!randomPoem.content_en;
      if (lang === 'PT') return !!randomPoem.content_pt;
      return false;
    };

    if (!hasLangContent(selectedLang)) {
      if (randomPoem.content_pt) {
        setSelectedLang('PT');
      } else if (randomPoem.content_en) {
        setSelectedLang('EN');
      } else if (randomPoem.content_jp) {
        setSelectedLang('JP');
      } else if (randomPoem.content_ro) {
        setSelectedLang('RO');
      }
    }
  }, [randomPoem, selectedLang]);

  const getNavigationIds = () => {
    if (availableIds && availableIds.length > 0) {
      return availableIds;
    }
    return volumesList.map((v) => v.id);
  };

  const navigatePoem = (direction) => {
    if (isHome) {
      if (direction === 'next') {
        const navIds = getNavigationIds();
        if (navIds.length > 0) {
          fetchPoemById(navIds[0]);
        }
      }
      return;
    }

    if (!randomPoem) return;
    const navIds = getNavigationIds();
    const currentIdStr = String(randomPoem.id);
    const currentIndex = navIds.indexOf(currentIdStr);

    if (currentIndex === -1) {
      if (navIds.length > 0) {
        fetchPoemById(navIds[0]);
      }
      return;
    }

    if (direction === 'next') {
      if (currentIndex < navIds.length - 1) {
        fetchPoemById(navIds[currentIndex + 1]);
      } else {
        fetchPoemById(navIds[0]); // Wrap
      }
    } else if (direction === 'prev') {
      if (currentIndex > 0) {
        fetchPoemById(navIds[currentIndex - 1]);
      } else {
        // Se estiver no primeiro poema e voltar, retorna para a Home
        window.location.hash = '';
        setIsHome(true);
        setRandomPoem(null);
        currentPoemIdRef.current = null;
        setIsCommentsOpen(false);
      }
    }
  };

  // 3. Efeito para registrar os listeners globais de gestos (scroll e touch swipe)
  useEffect(() => {
    const canScrollElement = (element, deltaY) => {
      if (!element || element === document.body || element === document.documentElement) {
        return false;
      }

      const style = window.getComputedStyle(element);
      
      // Verifica scroll vertical
      const overflowY = style.overflowY;
      const isScrollableY = overflowY === 'auto' || overflowY === 'scroll';
      if (isScrollableY) {
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        if (deltaY > 0) {
          if (scrollTop + clientHeight < scrollHeight - 1) return true;
        } else {
          if (scrollTop > 0) return true;
        }
      }

      // Verifica scroll horizontal (relevante para escrita vertical)
      const overflowX = style.overflowX;
      const isScrollableX = overflowX === 'auto' || overflowX === 'scroll';
      if (isScrollableX) {
        const scrollLeft = element.scrollLeft;
        const scrollWidth = element.scrollWidth;
        const clientWidth = element.clientWidth;
        if (deltaY > 0) {
          if (scrollLeft + clientWidth < scrollWidth - 1) return true;
        } else {
          if (scrollLeft > 0) return true;
        }
      }

      return canScrollElement(element.parentElement, deltaY);
    };

    const isWindowScrollable = (deltaY) => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (deltaY > 0) {
        if (scrollTop + clientHeight < scrollHeight - 1) return true;
      } else {
        if (scrollTop > 0) return true;
      }

      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = window.innerWidth;
      if (deltaY > 0) {
        if (scrollLeft + clientWidth < scrollWidth - 1) return true;
      } else {
        if (scrollLeft > 0) return true;
      }

      return false;
    };

    const handleWheel = (e) => {
      if (isAdmin || isLoading) return;

      // Se o scroll vier de dentro do sidebar, deixa rolar a lista normalmente
      if (e.target.closest('#nav-desktop') || e.target.closest('#nav-mobile')) {
        return;
      }

      const deltaY = e.deltaY;

      // Se algum elemento interno puder scrollar na direção solicitada, deixa rolar
      if (canScrollElement(e.target, deltaY)) {
        return;
      }

      // Se a própria janela puder scrollar na direção solicitada, deixa rolar
      if (isWindowScrollable(deltaY)) {
        return;
      }

      // Impede o scroll padrão no modo leitura para focar nos gestos de virada de página
      e.preventDefault();

      const now = Date.now();
      if (now - lastScrollTimeRef.current < 1200) {
        return; // Ignora se estiver no cooldown de 1.2s
      }

      const direction = deltaY > 0 ? 'next' : 'prev';
      navigatePoem(direction);
      lastScrollTimeRef.current = now;
    };

    const handleTouchStart = (e) => {
      if (isAdmin || isLoading) return;
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (isAdmin || isLoading) return;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartYRef.current - touchEndY; // positivo se arrastar para cima (swipe up)

      // Mínimo de 50px de deslocamento para evitar falsos gatilhos
      if (Math.abs(deltaY) < 50) return;

      const scrollDeltaY = deltaY > 0 ? 1 : -1;

      // Se algum elemento interno puder scrollar na direção solicitada, deixa rolar
      if (canScrollElement(e.target, scrollDeltaY)) {
        return;
      }

      // Se a própria janela puder scrollar na direção solicitada, deixa rolar
      if (isWindowScrollable(scrollDeltaY)) {
        return;
      }

      const now = Date.now();
      if (now - lastScrollTimeRef.current < 1200) {
        return; // Ignora se estiver no cooldown de 1.2s
      }

      const direction = deltaY > 0 ? 'next' : 'prev';
      navigatePoem(direction);
      lastScrollTimeRef.current = now;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isAdmin, isLoading, availableIds, randomPoem]);

  // Busca poema aleatório
  const fetchRandomPoem = () => {
    setIsLoading(true);
    fetch(`${API_BASE}/poem`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setRandomPoem(data.data);
          currentPoemIdRef.current = String(data.data.id);
          window.location.hash = String(data.data.id);
          trackView(data.data.id);
          setIsHome(false);
          fetchComments(data.data.id);
        } else {
          showStatus('error', 'Nenhum poema encontrado no cache.');
        }
      })
      .catch((err) => {
        console.error(err);
        showStatus('error', 'Falha ao buscar poema.');
      })
      .finally(() => setIsLoading(false));
  };

  // Busca poema por ID específico (Volumes 01 a 81 e PS)
  const fetchPoemById = (id) => {
    if (id === '82') {
      setRandomPoem({
        id: '82',
        content: 'Post Scriptum',
        author_name: 'Luka Sant'
      });
      setComments([]);
      currentPoemIdRef.current = '82';
      window.location.hash = '82';
      setIsHome(false);
      return;
    }
    setIsLoading(true);
    fetch(`${API_BASE}/api/poem/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Poema não encontrado');
        }
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          setRandomPoem(data.data);
          currentPoemIdRef.current = String(data.data.id);
          window.location.hash = String(data.data.id);
          trackView(data.data.id);
          setIsHome(false);
          fetchComments(data.data.id);
        } else {
          showStatus('error', 'Erro ao carregar poema.');
        }
      })
      .catch((err) => {
        console.error(err);
        setRandomPoem({
          id: id,
          content: 'Volume não cadastrado.',
          author_name: 'Tite Kubo'
        });
        setComments([]);
        showStatus('error', `Volume ${id === '82' ? 'PS' : String(id).padStart(2, '0')} não cadastrado.`);
      })
      .finally(() => setIsLoading(false));
  };

  const isActive = (item) => {
    if (!randomPoem) return false;
    return String(randomPoem.id) === String(item.id);
  };

  // Registra visualização de forma assíncrona com deduplicação
  const trackView = (id) => {
    if (!id) return;
    if (lastTrackedPoemIdRef.current === String(id)) {
      return; // Evita registrar visualização repetida no React StrictMode double-mount
    }
    lastTrackedPoemIdRef.current = String(id);
    fetch(`${API_BASE}/poem/${id}/view`, { method: 'POST' })
      .then((res) => {
        if (res.status === 429) {
          console.warn('Rate limit atingido para view de poema ID:', id);
        } else {
          setTimeout(fetchRanking, 500);
        }
      })
      .catch((err) => {
        // Reduz ruído de log se o servidor estiver reiniciando
        console.warn('Erro ao registrar view (o servidor pode estar indisponível):', err.message || err);
      });
  };

  // Busca ranking top 5
  const fetchRanking = () => {
    fetch(`${API_BASE}/ranking`)
      .then((res) => res.json())
      .then((data) => {
        if (data.top_5_lidos) {
          setRanking(data.top_5_lidos);
        }
      })
      .catch((err) => {
        // Reduz ruído de log se o servidor estiver indisponível
        console.warn('Servidor offline ou erro ao buscar ranking:', err.message || err);
      });
  };

  // Envia novo poema
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPoem.content.trim() || !newPoem.author_name.trim()) {
      showStatus('error', 'Todos os campos são obrigatórios!');
      return;
    }

    fetch(`${API_BASE}/poem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': adminToken
      },
      body: JSON.stringify(newPoem),
    })
      .then(async (res) => {
        if (res.status === 401) {
          handleAdminLogout();
          return;
        }
        const data = await res.json();
        if (res.status === 201) {
          showStatus('success', 'Poema criado com sucesso!');
          setNewPoem({ content: '', author_name: '', content_jp: '', content_ro: '', content_en: '', content_pt: '' });
          fetchRanking();

          // Atualiza a lista de IDs disponíveis
          fetch(`${API_BASE}/api/poems/ids`)
            .then((res) => res.json())
            .then((data) => {
              if (data.ids) {
                setAvailableIds(data.ids.map(String));
              }
            })
            .catch((err) => console.error('Erro ao atualizar IDs no submit:', err));
        } else if (res.status === 429) {
          showStatus('error', 'Muitas requisições! Aguarde antes de enviar.');
        } else {
          showStatus('error', data.error || 'Falha ao salvar poema.');
        }
      })
      .catch((err) => {
        console.error(err);
        showStatus('error', 'Erro de conexão com o servidor.');
      });
  };

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 5000);
  };

  return (
    <div className={`app-wrapper ${isAdmin ? 'admin-mode' : 'manga-mode'} ${isDarkTheme ? 'dark-theme' : ''}`}>
      
      {/* O botão de engrenagem do Admin foi removido do leitor público e substituído pela URL secreta /#admin */}

      {/* Botão flutuante de Comentários */}
      {!isAdmin && !isHome && randomPoem && randomPoem.content !== 'Volume não cadastrado.' && (
        <button 
          className={`toggle-comments-btn ${isCommentsOpen ? 'active' : ''}`}
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          title={
            isCommentsOpen 
              ? (selectedLang === 'PT' ? "Fechar Comentários" : "Close Comments") 
              : (selectedLang === 'PT' ? "Ver Comentários" : "View Comments")
          }
        >
          <span className="btn-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </span>
        </button>
      )}

      {statusMsg.text && (
        <div className={`status-toast ${statusMsg.type}`}>
          {statusMsg.type === 'success' ? (
            <svg className="toast-icon success" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', display: 'inline-block', verticalAlign: 'middle'}}>
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg className="toast-icon error" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', display: 'inline-block', verticalAlign: 'middle'}}>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          )}
          <span style={{verticalAlign: 'middle'}}>{statusMsg.text}</span>
        </div>
      )}

      {/* Modal de Autenticação Admin (Manga Style) */}
      {showAuthModal && (
        <div className="manga-modal-overlay">
          <div className="manga-modal-content">
            <div className="manga-modal-header">
              <h3>Acesso do Administrador</h3>
              <button className="close-comments-btn" onClick={() => { setShowAuthModal(false); setAuthPassword(''); }}>×</button>
            </div>
            <form onSubmit={handleVerifyPassword} className="manga-modal-form">
              <p className="manga-modal-text">Insira a chave de liberação (ex: bankai) para acessar o painel administrativo.</p>
              <div className="comment-input-group">
                <input
                  type="password"
                  placeholder="Chave de Acesso"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="manga-modal-actions">
                <button type="submit" className="manga-next-btn">Liberar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODO LEITURA (Manga Minimalist Aesthetic) */}
      {!isAdmin ? (
        <div className="manga-container">
          {/* Desktop Navigation Sidebar (Left) */}
          <nav className="nav visible" id="nav-desktop">
            <div className="index">
              {volumesList.map((item) => (
                <div key={item.id} onClick={() => fetchPoemById(item.id)}>
                  <p className={isActive(item) ? 'active' : ''}>{item.label}</p>
                </div>
              ))}
            </div>
            <div className="nav-controls">
              <div id="nav-item-randomizer" onClick={fetchRandomPoem} title="Sorteador Rápido">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.8538 11.1462C14.9002 11.1927 14.9371 11.2478 14.9623 11.3085C14.9874 11.3692 15.0004 11.4343 15.0004 11.5C15.0004 11.5657 14.9874 11.6307 14.9623 11.6914C14.9371 11.7521 14.9002 11.8073 14.8538 11.8537L13.3538 13.3537C13.2599 13.4475 13.1327 13.5003 13 13.5003C12.8673 13.5003 12.7401 13.4475 12.6462 13.3537C12.5524 13.2599 12.4997 13.1327 12.4997 13C12.4997 12.8673 12.5524 12.74 12.6462 12.6462L13.2931 12H12.5588C11.8426 11.9994 11.1368 11.8281 10.5 11.5004C9.86322 11.1727 9.31365 10.698 8.89688 10.1156L6.28937 6.4656C5.96519 6.01263 5.53775 5.64342 5.04246 5.38855C4.54716 5.13367 3.99827 5.00047 3.44125 4.99997H2C1.86739 4.99997 1.74021 4.94729 1.64645 4.85353C1.55268 4.75976 1.5 4.63258 1.5 4.49997C1.5 4.36736 1.55268 4.24019 1.64645 4.14642C1.74021 4.05265 1.86739 3.99997 2 3.99997H3.44125C4.15743 4.00057 4.86316 4.17181 5.49997 4.49951C6.13679 4.82721 6.68635 5.30193 7.10313 5.88435L9.71062 9.53435C10.0348 9.98732 10.4623 10.3565 10.9575 10.6114C11.4528 10.8663 12.0017 10.9995 12.5588 11H13.2931L12.6462 10.3537C12.5524 10.2599 12.4997 10.1327 12.4997 9.99997C12.4997 9.86729 12.5524 9.74004 12.6462 9.64622C12.7401 9.5524 12.8673 9.49969 13 9.49969C13.1327 9.49969 13.2599 9.5524 13.3538 9.64622L14.8538 11.1462ZM8.9375 6.68747C8.99093 6.72564 9.05136 6.75291 9.11533 6.76772C9.1793 6.78254 9.24556 6.7846 9.31033 6.77381C9.3751 6.76301 9.4371 6.73957 9.49281 6.70481C9.54852 6.67005 9.59684 6.62466 9.635 6.57122L9.71 6.46685C10.0341 6.01356 10.4616 5.64406 10.957 5.38896C11.4524 5.13386 12.0015 5.00051 12.5588 4.99997H13.2931L12.6462 5.64622C12.5524 5.74004 12.4997 5.86729 12.4997 5.99997C12.4997 6.13265 12.5524 6.2599 12.6462 6.35372C12.7401 6.44754 12.8673 6.50025 13 6.50025C13.1327 6.50025 13.2599 6.44754 13.3538 6.35372L14.8538 4.85372C14.9002 4.80729 14.9371 4.75214 14.9623 4.69144C14.9874 4.63074 15.0004 4.56568 15.0004 4.49997C15.0004 4.43427 14.9874 4.3692 14.9623 4.3085C14.9371 4.2478 14.9002 4.19266 14.8538 4.14622L13.3538 2.64622C13.2599 2.5524 13.1327 2.49969 13 2.49969C12.8673 2.49969 12.7401 2.5524 12.6462 2.64622C12.5524 2.74004 12.4997 2.86729 12.4997 2.99997C12.4997 3.13265 12.5524 3.2599 12.6462 3.35372L13.2931 3.99997H12.5588C11.8426 4.00057 11.1368 4.17181 10.5 4.49951C9.86322 4.82721 9.31365 5.30193 8.89688 5.88435L8.82187 5.98872C8.78348 6.04216 8.75601 6.10264 8.74104 6.16672C8.72607 6.23079 8.7239 6.29719 8.73464 6.3621C8.74538 6.42701 8.76883 6.48917 8.80364 6.545C8.83845 6.60084 8.88394 6.64925 8.9375 6.68747ZM7.0625 9.31247C7.00907 9.27431 6.94864 9.24704 6.88467 9.23222C6.8207 9.21741 6.75444 9.21534 6.68967 9.22614C6.6249 9.23693 6.56289 9.26038 6.50719 9.29514C6.45148 9.3299 6.40316 9.37529 6.365 9.42872L6.29 9.5331C5.96589 9.98638 5.53841 10.3559 5.04299 10.611C4.54757 10.8661 3.99849 10.9994 3.44125 11H2C1.86739 11 1.74021 11.0527 1.64645 11.1464C1.55268 11.2402 1.5 11.3674 1.5 11.5C1.5 11.6326 1.55268 11.7598 1.64645 11.8535C1.74021 11.9473 1.86739 12 2 12H3.44125C4.15743 11.9994 4.86316 11.8281 5.49997 11.5004C6.13679 11.1727 6.68635 10.698 7.10313 10.1156L7.17812 10.0112C7.21652 9.95779 7.24399 9.8973 7.25896 9.83323C7.27393 9.76916 7.2761 9.70276 7.26536 9.63785C7.25462 9.57293 7.23117 9.51078 7.19636 9.45494C7.16155 9.39911 7.11606 9.35069 7.0625 9.31247Z" fill="currentColor"></path>
                </svg>
              </div>
              <div id="nav-item-x" title="Perfil no X (Twitter)">
                <a href="https://x.com/Lukadsant" target="_blank" rel="noopener noreferrer">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
              <div id="nav-item-gallery">
                <a href="/gallery.html" target="_blank" rel="noopener noreferrer">
                  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3H4C3.73478 3 3.48043 3.10536 3.29289 3.29289C3.10536 3.48043 3 3.73478 3 4V12C3 12.2652 3.10536 12.5196 3.29289 12.7071C3.48043 12.8946 3.73478 13 4 13H12C12.2652 13 12.5196 12.8946 12.7071 12.7071C12.8946 12.5196 13 12.2652 13 12V4C13 3.73478 12.8946 3.48043 12.7071 3.29289C12.5196 3.10536 12.2652 3 12 3ZM12 12H4V4H12V12ZM15 3.5V12.5C15 12.6326 14.9473 12.7598 14.8536 12.8536C14.7598 12.9473 14.6326 13 14.5 13C14.3674 13 14.2402 12.9473 14.1464 12.8536C14.0527 12.7598 14 12.6326 14 12.5V3.5C14 3.36739 14.0527 3.24021 14.1464 3.14645C14.2402 3.05268 14.3674 3 14.5 3C14.6326 3 14.7598 3.05268 14.8536 3.14645C14.9473 3.24021 15 3.36739 15 3.5ZM2 3.5V12.5C2 12.6326 1.94732 12.7598 1.85355 12.8536C1.75979 12.9473 1.63261 13 1.5 13C1.36739 13 1.24021 12.9473 1.14645 12.8536C1.05268 12.7598 1 12.6326 1 12.5V3.5C1 3.36739 1.05268 3.24021 1.14645 3.14645C1.24021 3.05268 1.36739 3 1.5 3C1.63261 3 1.75979 3.05268 1.85355 3.14645C1.94732 3.24021 2 3.36739 2 3.5Z" fill="currentColor"></path>
                  </svg>
                </a>
              </div>
              <div id="nav-item-theme" onClick={toggleTheme} title={isDarkTheme ? "Modo Claro" : "Modo Escuro"}>
                {isDarkTheme ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </div>
            </div>
          </nav>

          {/* Mobile Top Header Menu */}
          <menu className="mobile-menu">
            <div className="controls">
              <div className="randomizer" onClick={fetchRandomPoem} title="Sorteador Rápido">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.8538 11.1462C14.9002 11.1927 14.9371 11.2478 14.9623 11.3085C14.9874 11.3692 15.0004 11.4343 15.0004 11.5C15.0004 11.5657 14.9874 11.6307 14.9623 11.6914C14.9371 11.7521 14.9002 11.8073 14.8538 11.8537L13.3538 13.3537C13.2599 13.4475 13.1327 13.5003 13 13.5003C12.8673 13.5003 12.7401 13.4475 12.6462 13.3537C12.5524 13.2599 12.4997 13.1327 12.4997 13C12.4997 12.8673 12.5524 12.74 12.6462 12.6462L13.2931 12H12.5588C11.8426 11.9994 11.1368 11.8281 10.5 11.5004C9.86322 11.1727 9.31365 10.698 8.89688 10.1156L6.28937 6.4656C5.96519 6.01263 5.53775 5.64342 5.04246 5.38855C4.54716 5.13367 3.99827 5.00047 3.44125 4.99997H2C1.86739 4.99997 1.74021 4.94729 1.64645 4.85353C1.55268 4.75976 1.5 4.63258 1.5 4.49997C1.5 4.36736 1.55268 4.24019 1.64645 4.14642C1.74021 4.05265 1.86739 3.99997 2 3.99997H3.44125C4.15743 4.00057 4.86316 4.17181 5.49997 4.49951C6.13679 4.82721 6.68635 5.30193 7.10313 5.88435L9.71062 9.53435C10.0348 9.98732 10.4623 10.3565 10.9575 10.6114C11.4528 10.8663 12.0017 10.9995 12.5588 11H13.2931L12.6462 10.3537C12.5524 10.2599 12.4997 10.1327 12.4997 9.99997C12.4997 9.86729 12.5524 9.74004 12.6462 9.64622C12.7401 9.5524 12.8673 9.49969 13 9.49969C13.1327 9.49969 13.2599 9.5524 13.3538 9.64622L14.8538 11.1462ZM8.9375 6.68747C8.99093 6.72564 9.05136 6.75291 9.11533 6.76772C9.1793 6.78254 9.24556 6.7846 9.31033 6.77381C9.3751 6.76301 9.4371 6.73957 9.49281 6.70481C9.54852 6.67005 9.59684 6.62466 9.635 6.57122L9.71 6.46685C10.0341 6.01356 10.4616 5.64406 10.957 5.38896C11.4524 5.13386 12.0015 5.00051 12.5588 4.99997H13.2931L12.6462 5.64622C12.5524 5.74004 12.4997 5.86729 12.4997 5.99997C12.4997 6.13265 12.5524 6.2599 12.6462 6.35372C12.7401 6.44754 12.8673 6.50025 13 6.50025C13.1327 6.50025 13.2599 6.44754 13.3538 6.35372L14.8538 4.85372C14.9002 4.80729 14.9371 4.75214 14.9623 4.69144C14.9874 4.63074 15.0004 4.56568 15.0004 4.49997C15.0004 4.43427 14.9874 4.3692 14.9623 4.3085C14.9371 4.2478 14.9002 4.19266 14.8538 4.14622L13.3538 2.64622C13.2599 2.5524 13.1327 2.49969 13 2.49969C12.8673 2.49969 12.7401 2.5524 12.6462 2.64622C12.5524 2.74004 12.4997 2.86729 12.4997 2.99997C12.4997 3.13265 12.5524 3.2599 12.6462 3.35372L13.2931 3.99997H12.5588C11.8426 4.00057 11.1368 4.17181 10.5 4.49951C9.86322 4.82721 9.31365 5.30193 8.89688 5.88435L8.82187 5.98872C8.78348 6.04216 8.75601 6.10264 8.74104 6.16672C8.72607 6.23079 8.7239 6.29719 8.73464 6.3621C8.74538 6.42701 8.76883 6.48917 8.80364 6.545C8.83845 6.60084 8.88394 6.64925 8.9375 6.68747ZM7.0625 9.31247C7.00907 9.27431 6.94864 9.24704 6.88467 9.23222C6.8207 9.21741 6.75444 9.21534 6.68967 9.22614C6.6249 9.23693 6.56289 9.26038 6.50719 9.29514C6.45148 9.3299 6.40316 9.37529 6.365 9.42872L6.29 9.5331C5.96589 9.98638 5.53841 10.3559 5.04299 10.611C4.54757 10.8661 3.99849 10.9994 3.44125 11H2C1.86739 11 1.74021 11.0527 1.64645 11.1464C1.55268 11.2402 1.5 11.3674 1.5 11.5C1.5 11.6326 1.55268 11.7598 1.64645 11.8535C1.74021 11.9473 1.86739 12 2 12H3.44125C4.15743 11.9994 4.86316 11.8281 5.49997 11.5004C6.13679 11.1727 6.68635 10.698 7.10313 10.1156L7.17812 10.0112C7.21652 9.95779 7.24399 9.8973 7.25896 9.83323C7.27393 9.76916 7.2761 9.70276 7.26536 9.63785C7.25462 9.57293 7.23117 9.51078 7.19636 9.45494C7.16155 9.39911 7.11606 9.35069 7.0625 9.31247Z" fill="currentColor"></path>
                </svg>
              </div>
              <div className="menu-title"><p> BLEACH POEMS </p></div>
              <div className="mobile-theme-toggle" onClick={toggleTheme} title="Alternar Tema">
                {isDarkTheme ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </div>
              <div className="menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} title="Abrir Menu">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.31522 8.44047L6.69023 4.06547C6.73086 4.02479 6.77911 3.99252 6.83222 3.97051C6.88533 3.94849 6.94226 3.93716 6.99976 3.93716C7.05725 3.93716 7.11418 3.94849 7.16729 3.97051C7.22041 3.99252 7.26866 4.02479 7.30929 4.06547L11.6843 8.44047C11.7664 8.52256 11.8125 8.6339 11.8125 8.75C11.8125 8.8661 11.7664 8.97744 11.6843 9.05953C11.6022 9.14163 11.4909 9.18774 11.3748 9.18774C11.2587 9.18774 11.1473 9.14163 11.0652 9.05953L6.99976 4.99352L2.93429 9.05953C2.89364 9.10018 2.84538 9.13242 2.79227 9.15442C2.73916 9.17642 2.68224 9.18774 2.62476 9.18774C2.56727 9.18774 2.51035 9.17642 2.45724 9.15442C2.40413 9.13242 2.35587 9.10018 2.31522 9.05953C2.27458 9.01888 2.24233 8.97063 2.22034 8.91752C2.19834 8.86441 2.18701 8.80749 2.18701 8.75C2.18701 8.69251 2.19834 8.63559 2.22034 8.58248C2.24233 8.52937 2.27458 8.48112 2.31522 8.44047Z" fill="currentColor"></path>
                </svg>
              </div>
            </div>
          </menu>

          {/* Backdrop overlay */}
          <div className={`mobile-menu-backdrop ${isMobileMenuOpen ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>

          {/* Mobile Right Sidebar (Sliding Menu) */}
          <nav className={`nav ${isMobileMenuOpen ? 'open' : ''}`} id="nav-mobile">
            <div className="index">
              {volumesList.map((item) => (
                <div 
                  key={item.id} 
                  id={item.id !== '82' ? `nav-item-${item.id}` : undefined} 
                  onClick={() => { fetchPoemById(item.id); setIsMobileMenuOpen(false); }}
                >
                  <p className={isActive(item) ? 'active' : ''}>{item.label}</p>
                </div>
              ))}
            </div>
          </nav>

          <div className="manga-page">
            {isHome ? (
              <div className="manga-home">
                <h1 className="home-title">BLEACH POEMS</h1>
                <p className="home-subtitle">
                  {selectedLang === 'PT'
                    ? "Uma antologia dos poemas de abertura dos volumes de Bleach por Tite Kubo"
                    : "A anthology of introductory poems from Bleach volumes by Tite Kubo"}
                </p>
                <div className="home-banner-frame">
                  <img 
                    src="/manga_eyes_banner.png" 
                    alt="Manga Banner" 
                    className="home-banner" 
                  />
                </div>

                {livePoemObj && (
                  <div className="home-day-poem" onClick={() => fetchPoemById(livePoemObj.id)}>
                    <span className="day-poem-label">
                      {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    
                    {(livePoemObj.content_jp || livePoemObj.content_ro || livePoemObj.content_en || livePoemObj.content_pt) && (
                      <div className="manga-lang-selector">
                        {['JP', 'RO', 'EN', 'PT'].map((lang) => {
                          const hasContent = 
                            (lang === 'JP' && livePoemObj.content_jp) ||
                            (lang === 'RO' && livePoemObj.content_ro) ||
                            (lang === 'EN' && livePoemObj.content_en) ||
                            (lang === 'PT' && livePoemObj.content_pt);
                          if (!hasContent) return null;
                          return (
                            <button
                              key={lang}
                              className={`lang-tab ${selectedLang === lang ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLang(lang);
                              }}
                            >
                              {lang}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <p className="day-poem-content">
                      {(() => {
                        let targetContent = livePoemObj.content;
                        if (selectedLang === 'JP' && livePoemObj.content_jp) {
                          targetContent = livePoemObj.content_jp;
                        } else if (selectedLang === 'RO' && livePoemObj.content_ro) {
                          targetContent = livePoemObj.content_ro;
                        } else if (selectedLang === 'EN' && livePoemObj.content_en) {
                          targetContent = livePoemObj.content_en;
                        } else if (selectedLang === 'PT' && livePoemObj.content_pt) {
                          targetContent = livePoemObj.content_pt;
                        }
                        
                        let displayContent = targetContent.replace(/\s+/g, ' ');
                        if (displayContent.length > 60) {
                          displayContent = displayContent.slice(0, 60).trim() + '...';
                        }
                        return `"${displayContent}"`;
                      })()}
                    </p>
                    <p className="day-poem-author">
                      — {livePoemObj.author_name || 'Tite Kubo'}
                    </p>
                    <p className="day-poem-volume">
                      {getVolumeLabel(livePoemObj.id)}
                    </p>
                  </div>
                )}

                <div className="home-scroll-prompt">
                  <p>{selectedLang === 'PT' ? "Explorar" : "Explore"}</p>
                  <span className="arrow-down">↓</span>
                </div>
              </div>
            ) : randomPoem && randomPoem.id === '82' ? (
              <div className="manga-ps-page">
                {/* Banner */}
                <div className="manga-panel-frame">
                  <img src="/manga_eyes_banner.png" alt="Manga Banner" className="manga-banner" />
                </div>

                <h2 className="ps-title">POST SCRIPTUM</h2>
                
                <div className="ps-section">
                  <h3 className="ps-section-title">
                    {selectedLang === 'PT' ? "SOBRE O PROJETO" : "ABOUT THE PROJECT"}
                  </h3>
                  <p className="ps-text">
                    {selectedLang === 'PT' 
                      ? "Uma antologia digital dedicada a catalogar todos os poemas de abertura dos volumes de Bleach, escritos originalmente por Tite Kubo. A plataforma oferece suporte a múltiplos idiomas e reproduz a atmosfera e ritmo solene de leitura dos volumes originais da série."
                      : "A digital anthology dedicated to cataloging all introductory opening poems from the Bleach manga volumes, written by Tite Kubo. The platform supports multiple languages and reproduces the solemn atmosphere and reading rhythm of the series' original volumes."}
                  </p>
                  <p className="ps-text tech-specs">
                    <strong>{selectedLang === 'PT' ? "Tecnologias:" : "Tech Stack:"}</strong> Go (Golang), PostgreSQL, GORM, Redis (caching O(1)), Server-Sent Events (SSE) & React + Vite.
                  </p>
                </div>

                <div className="ps-separator"></div>

                <div className="ps-section">
                  <h3 className="ps-section-title">
                    {selectedLang === 'PT' ? "DESENVOLVEDOR" : "THE DEVELOPER"}
                  </h3>
                  <p className="ps-text">
                    {selectedLang === 'PT'
                      ? "Construído por Luka D'Sant (@lukadsant), um profissional focado em criar experiências visuais, interfaces modernas e sistemas robustos."
                      : "Built by Luka D'Sant (@lukadsant), a professional focused on creating visual experiences, modern interfaces, and robust systems."}
                  </p>
                  <div className="ps-links">
                    <a href="https://x.com/Lukadsant" target="_blank" rel="noopener noreferrer" className="manga-next-btn ps-link-btn" style={{textDecoration: 'none', display: 'inline-block'}}>
                      Twitter / X
                    </a>
                    <a href="mailto:contato@lukadsant.dev" className="manga-next-btn ps-link-btn" style={{textDecoration: 'none', display: 'inline-block'}}>
                      Email
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Painel do Mangá (Character Banner) */}
                <div className="manga-panel-frame">
                  <img 
                    src={
                      randomPoem && Number(randomPoem.id) >= 1 && Number(randomPoem.id) <= 75
                        ? `/covers/cover_${randomPoem.id}.jpg`
                        : "/manga_eyes_banner.png"
                    } 
                    alt="Visual do Mangá" 
                    className="manga-banner"
                    onError={(e) => {
                      e.target.src = "/manga_eyes_banner.png";
                    }}
                  />
                </div>

                {/* Texto do Poema */}
                <div className="manga-poem-box">
                  {randomPoem ? (
                    <div className="manga-poem-flow">
                      {/* Alternador de Idiomas Minimalista (Multi-lang) */}
                      {(randomPoem.content_jp || randomPoem.content_ro || randomPoem.content_en || randomPoem.content_pt) && (
                        <div className="manga-lang-selector">
                          {['JP', 'RO', 'EN', 'PT'].map((lang) => {
                            const hasContent = 
                              (lang === 'JP' && randomPoem.content_jp) ||
                              (lang === 'RO' && randomPoem.content_ro) ||
                              (lang === 'EN' && randomPoem.content_en) ||
                              (lang === 'PT' && randomPoem.content_pt);
                            if (!hasContent) return null;
                            return (
                              <button
                                key={lang}
                                className={`lang-tab ${selectedLang === lang ? 'active' : ''}`}
                                onClick={() => setSelectedLang(lang)}
                              >
                                {lang}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <p className={`manga-poem-text ${selectedLang === 'JP' ? 'jp-mode' : ''}`}>
                        {(() => {
                          let targetContent = randomPoem.content;
                          if (selectedLang === 'JP' && randomPoem.content_jp) {
                            targetContent = randomPoem.content_jp;
                          } else if (selectedLang === 'RO' && randomPoem.content_ro) {
                            targetContent = randomPoem.content_ro;
                          } else if (selectedLang === 'EN' && randomPoem.content_en) {
                            targetContent = randomPoem.content_en;
                          } else if (selectedLang === 'PT' && randomPoem.content_pt) {
                            targetContent = randomPoem.content_pt;
                          }

                          const lines = targetContent.split('\n');
                          let charIndexAcc = 0;

                          return lines.map((line, lineIdx) => {
                            const lineStart = charIndexAcc;
                            charIndexAcc += line.length + 1; // +1 for the newline

                            return (
                              <span key={lineIdx} className="manga-poem-line">
                                {line.split('').map((char, charIdx) => {
                                  const absIdx = lineStart + charIdx;
                                  const isVisible = absIdx < visibleCharCount;
                                  return (
                                    <span
                                      key={charIdx}
                                      className={`char-fade ${isVisible ? 'visible' : ''}`}
                                    >
                                      {char}
                                    </span>
                                  );
                                })}
                              </span>
                            );
                          });
                        })()}
                      </p>
                      <p className="manga-poem-author">{randomPoem.author_name}</p>
                      <p className="manga-poem-volume">
                        {getVolumeLabel(randomPoem.id)}
                      </p>
                    </div>
                  ) : (
                    <p className="manga-placeholder">Carregando poema do minuto...</p>
                  )}
                </div>

              </>
            )}


          </div>

          {/* Sidebar de Comentários (Manga Style) */}
          {randomPoem && randomPoem.content !== 'Volume não cadastrado.' && (
            <div className={`manga-comments-sidebar ${isCommentsOpen ? 'open' : ''}`}>
              <div className="comments-sidebar-header">
                <h3 className="comments-section-title">
                  {selectedLang === 'PT' ? "Comentários" : "Comments"} ({comments.length})
                </h3>
                <button className="close-comments-btn" onClick={() => setIsCommentsOpen(false)}>×</button>
              </div>
              
              <div className="comments-list">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-user">{comment.username}</span>
                        <span className="comment-date">
                          {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="comment-content">{comment.content}</p>
                      <div className="comment-actions">
                        <button
                          className={`comment-like-btn ${likedComments.includes(comment.id) ? 'liked' : ''}`}
                          onClick={() => handleLikeComment(comment.id)}
                          disabled={likedComments.includes(comment.id)}
                          title={likedComments.includes(comment.id) ? "Você curtiu" : "Curtir comentário"}
                        >
                          <span className="like-icon" style={{display: 'inline-flex', alignItems: 'center'}}>
                            {likedComments.includes(comment.id) ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                              </svg>
                            )}
                          </span>
                          <span className="like-count">{comment.likes || 0}</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-comments-text">
                    {selectedLang === 'PT' 
                      ? "Nenhum comentário ainda. Seja o primeiro a comentar!" 
                      : "No comments yet. Be the first to comment!"}
                  </p>
                )}
              </div>

              <form onSubmit={handlePostComment} className="comment-form">
                <div className="comment-input-group">
                  <input
                    type="text"
                    placeholder={selectedLang === 'PT' ? "Seu Apelido" : "Your Nickname"}
                    value={commentForm.username}
                    onChange={(e) => setCommentForm({ ...commentForm, username: e.target.value })}
                    required
                    maxLength="50"
                  />
                </div>
                <div className="comment-input-group">
                  <textarea
                    placeholder={selectedLang === 'PT' ? "Escreva seu comentário..." : "Write your comment..."}
                    value={commentForm.content}
                    onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                    required
                    maxLength="300"
                    rows="3"
                  />
                </div>
                <button type="submit" className="manga-next-btn">
                  {selectedLang === 'PT' ? "Enviar" : "Send"}
                </button>
              </form>
            </div>
          )}

          {isCommentsOpen && (
            <div className="comments-sidebar-backdrop" onClick={() => setIsCommentsOpen(false)}></div>
          )}
        </div>
      ) : (
        /* MODO ADMINISTRADOR (Manga Style Dashboard) */
        <div className="app-container">
          <header className="app-header">
            <div className="logo-glow"></div>
            <button className="exit-admin-header-btn" onClick={handleAdminLogout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span style={{verticalAlign: 'middle'}}>Voltar ao Modo Leitura</span>
            </button>
            <h1>Painel do Administrador</h1>
            <p className="subtitle">Gerenciamento e Métricas do Poetry-as-a-Service</p>
          </header>

          <main className="app-grid">
            {/* Card 1: Feed Ao Vivo (SSE) */}
            <section id="live-feed-card" className="dashboard-card live-feed">
              <div className="card-header">
                <span className="pulse-indicator"></span>
                <h2>Poema do Dia</h2>
              </div>
              <div className="card-content">
                {livePoem ? (
                  <div className="live-poem-display">
                    <p className="poem-text">"{livePoem.split(' - ')[0]}"</p>
                    <p className="poem-author">-{livePoem.split(' - ')[1] || 'Desconhecido'}</p>
                  </div>
                ) : (
                  <p className="placeholder-text">Carregando Poema do Dia...</p>
                )}
              </div>
              <div className="card-footer" style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <span className="pulse-indicator" style={{width: '6px', height: '6px', backgroundColor: '#ef4444'}}></span>
                <small>Sincronizado diariamente via Server-Sent Events</small>
              </div>
            </section>

            {/* Card 2: Sorteador */}
            <section className="dashboard-card poem-randomizer">
              <div className="card-header">
                <h2>Visualização Rápida (O(1))</h2>
              </div>
              <div className="card-content">
                {randomPoem ? (
                  <div className="poem-display">
                    <p className="poem-text">"{randomPoem.content}"</p>
                    <p className="poem-author">-{randomPoem.author_name}</p>
                  </div>
                ) : (
                  <p className="placeholder-text">Clique para sortear...</p>
                )}
              </div>
              <div className="card-footer-action">
                <button 
                  onClick={fetchRandomPoem} 
                  className={`glow-btn ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Carregando...' : 'Sorteador Rápido'}
                </button>
              </div>
            </section>

            {/* Card 3: Form de Criação */}
            <section className="dashboard-card poem-creation">
              <div className="card-header">
                <h2>Adicionar Novo Poema</h2>
              </div>
              <form onSubmit={handleSubmit} className="creation-form">
                <div className="input-group">
                  <label htmlFor="author">Autor / Personagem</label>
                  <input
                    id="author"
                    type="text"
                    placeholder="Ex: Ichigo Kurosaki"
                    value={newPoem.author_name}
                    onChange={(e) => setNewPoem({ ...newPoem, author_name: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="content">Conteúdo Padrão (Geral)</label>
                  <textarea
                    id="content"
                    rows="2"
                    placeholder="Ex: Aquele que julga poder controlar a espada..."
                    value={newPoem.content}
                    onChange={(e) => setNewPoem({ ...newPoem, content: e.target.value })}
                    required
                  />
                </div>
                <div className="input-grid-2">
                  <div className="input-group">
                    <label htmlFor="content_jp">Japonês (Original)</label>
                    <textarea
                      id="content_jp"
                      rows="2"
                      placeholder="我らは　姿無き..."
                      value={newPoem.content_jp || ''}
                      onChange={(e) => setNewPoem({ ...newPoem, content_jp: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="content_ro">Romaji (Transliteração)</label>
                    <textarea
                      id="content_ro"
                      rows="2"
                      placeholder="warera wa..."
                      value={newPoem.content_ro || ''}
                      onChange={(e) => setNewPoem({ ...newPoem, content_ro: e.target.value })}
                    />
                  </div>
                </div>
                <div className="input-grid-2">
                  <div className="input-group">
                    <label htmlFor="content_en">Inglês</label>
                    <textarea
                      id="content_en"
                      rows="2"
                      placeholder="We fear..."
                      value={newPoem.content_en || ''}
                      onChange={(e) => setNewPoem({ ...newPoem, content_en: e.target.value })}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="content_pt">Português (Tradução)</label>
                    <textarea
                      id="content_pt"
                      rows="2"
                      placeholder="Tememos aquilo..."
                      value={newPoem.content_pt || ''}
                      onChange={(e) => setNewPoem({ ...newPoem, content_pt: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn">
                  Publicar e Disparar Evento
                </button>
              </form>
            </section>

            {/* Card 4: Top Ranking */}
            <section className="dashboard-card leaderboard">
              <div className="card-header">
                <h2>Top 5 Poemas Mais Lidos (Analytics)</h2>
              </div>
              <div className="card-content">
                {ranking.length > 0 ? (
                  <div className="ranking-list">
                    {ranking.map((item, idx) => (
                      <div key={item.poem_id} className={`ranking-item rank-${idx + 1}`}>
                        <div className="rank-position">{idx + 1}</div>
                        <div className="rank-details">
                          <p className="rank-text">"{item.content}"</p>
                          <p className="rank-author">-{item.author_name}</p>
                        </div>
                        <div className="rank-views">
                          <span className="views-count">{Math.round(item.views)}</span>
                          <span className="views-lbl">views</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="placeholder-text">Sem dados de visualização.</p>
                )}
              </div>
            </section>

            {/* Card 5: Moderação de Comentários */}
            <section className="dashboard-card comments-moderation">
              <div className="card-header">
                <h2>Moderador de Comentários (O(1))</h2>
              </div>
              <div className="card-content">
                {latestComments.length > 0 ? (
                  <div className="moderation-list">
                    {latestComments.map((comment) => (
                      <div key={comment.id} className="moderation-item">
                        <div className="moderation-details">
                          <p className="comment-meta">
                            <strong>{comment.username}</strong> no Vol. {String(comment.poem_id).padStart(2, '0')}
                            <span className="comment-time">
                              {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </p>
                          <p className="comment-body">"{comment.content}"</p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="delete-comment-btn"
                          title="Excluir Comentário"
                        >
                          Excluir
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="placeholder-text">Nenhum comentário recente para moderar.</p>
                )}
              </div>
            </section>
          </main>

          <footer className="app-footer">
            <p>Painel Administrativo da Arquitetura Distribuída</p>
            <button className="exit-admin-footer-btn" onClick={handleAdminLogout}>
              Sair do Painel Admin
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}

export default App;
