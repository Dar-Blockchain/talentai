// ============================================================================
// IntelligentProjectAnalyzer
// ---------------------------------------------------------------------------
// Ce module fournit une classe capable d'analyser un dépôt GitHub de manière
// intelligente et structurée, en combinant:
// - Une exploration récursive de l'arborescence du repo via l'API GitHub
// - Une analyse des fichiers clés (package.json, README, fichiers de code...)
// - Des heuristiques pour déduire le domaine, l'architecture et la cohérence
// - Un scoring qualitatif (maintenabilité, lisibilité, performance, sécurité...)
// - Des insights et recommandations concrètes pour améliorer le projet
// 
// Il interagit avec `evaluateRepo.js` pour récupérer des métriques et résultats
// complémentaires (scores, éligibilité hackathon, etc.).
// ============================================================================
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { analyzeRepo } = require('./evaluateRepo');

// ---------------------------------------------------------------------------
// Classe principale qui encapsule l'analyse du projet
// - Le constructeur initialise une structure d'état pour accumuler les résultats
//   d'analyse de haut niveau (but du projet, architecture, cohérence, qualité).
// ---------------------------------------------------------------------------
class IntelligentProjectAnalyzer {
    constructor() {
        // `analysis` maintient un résumé global des résultats majeurs.
        this.analysis = {
            projectPurpose: null, // Finalité/domaine du projet (ex: Backend API, E-commerce...)
            architecture: null,   // Type d'architecture détectée (MVC, Layered, Next.js...)
            coherence: null,      // Cohérence (naming, structure, patterns)
            quality: null,        // Qualité (maintenabilité, lisibilité, sécurité...)
            insights: []          // Liste d'insights et recommandations générées
        };
    }

    // -----------------------------------------------------------------------
    // analyzeRepository(owner, repo, hackathonCriteria)
    // -----------------------------------------------------------------------
    // But: point d'entrée principal. Orchestration de toutes les étapes:
    // 0) Appel à analyzeRepo (du module evaluateRepo) pour récupérer une analyse
    //    complète et des scores objectifs (structure, fichiers, critères...)
    // 1) Récupération récursive de la structure du repo (fichiers/dossiers)
    // 2) Analyse de la finalité (purpose) et du domaine via les contenus
    // 3) Analyse de l'architecture et de patterns
    // 4) Analyse de la cohérence du code (naming/structure/patterns)
    // 5) Analyse de la qualité du code (maintenabilité, lisibilité, perf, sécurité, tests)
    // 6) Génération d'insights et recommandations
    // 
    // Paramètres:
    // - owner: propriétaire GitHub
    // - repo: nom du dépôt GitHub
    // - hackathonCriteria: critères d'éligibilité au hackathon (optionnel)
    // 
    // Retour: objet consolidé avec toutes les analyses et scores
    // -----------------------------------------------------------------------
    async analyzeRepository(owner, repo, hackathonCriteria = null) {
        console.log('\n🧠 INTELLIGENT PROJECT ANALYSIS');
        console.log('================================');
        
        const selectedTemplate = "auto"; // Choix automatique du template de projet
        try {

            // 0. Récupère une analyse globale (scores, éligibilité, résumé des fichiers)
            const analyzeRepoResult = await analyzeRepo(owner, repo, selectedTemplate, hackathonCriteria);
            console.log("result is : ", analyzeRepoResult);
            
 
            // 1. Récupère la structure du repository (fichiers, répertoires, contenus)
            const repoStructure = await this.fetchRepositoryStructure(owner, repo);
            console.log("111");
            
            // 2. Analyse la finalité du projet et son domaine
            const purposeAnalysis = await this.analyzeProjectPurpose(repoStructure);
            console.log("222");
            
            // 3. Analyse l'architecture et les patterns utilisés
            const architectureAnalysis = await this.analyzeArchitecture(repoStructure);
            console.log("333");
            
            // 4. Analyse la cohérence du code (naming/structure/patterns)
            const coherenceAnalysis = await this.analyzeCoherence(repoStructure);
            console.log("444");
            
            // 5. Analyse la qualité du code (maintenabilité, lisibilité, perf, sécurité, tests)
            const qualityAnalysis = await this.analyzeCodeQuality(repoStructure);
            console.log("555");
            
            // 6. Génère des insights et recommandations basés sur les analyses précédentes
            const insights = await this.generateInsights(repoStructure, purposeAnalysis, architectureAnalysis, coherenceAnalysis, qualityAnalysis);
            console.log("666");

            // Exemple de calcul local (non utilisé ensuite): overallScore
            const overallScore= qualityAnalysis.overall * 10; 
            console.log("check overall: ", overallScore);
            
            // Agrégation et retour d'un objet consolidé combinant résultats locaux
            // et résultats provenant de analyzeRepo (scores objectives, éligibilité, etc.)
            return {
                projectPurpose: purposeAnalysis,
                architecture: architectureAnalysis,
                coherence: coherenceAnalysis,
                quality: qualityAnalysis,
                insights: insights,
                structure: repoStructure, 


                eligibilityResults: analyzeRepoResult.eligibilityResults,
                githubData: analyzeRepoResult.githubData,
                evaluationScores: analyzeRepoResult.criteriaResults,
                comprehensiveAnalysis: analyzeRepoResult.comprehensiveAnalysis,
                overallScore: analyzeRepoResult.finalScore
            };
            
        } catch (error) {
            // Gestion d'erreur globale de l'analyse intelligente
            console.error('Error in intelligent analysis:', error);
            return null;
        }
    }

    // -----------------------------------------------------------------------
    // fetchRepositoryStructure(owner, repo)
    // -----------------------------------------------------------------------
    // But: explorer récursivement le dépôt pour construire une structure riche:
    // - files, directories, allFiles, allDirectories
    // - fileContents (contenu brut) pour les fichiers importants
    // - analysis (résumé: purpose, features, stack, architecture...)
    // 
    // Utilise crawlRepository pour parcourir tout l'arbre via l'API GitHub.
    // -----------------------------------------------------------------------
    async fetchRepositoryStructure(owner, repo) {
        console.log("owner", owner);
        console.log("repo", repo);
        console.log('📁 Fetching repository structure...');

        
        const structure = {
            files: {},            // Fichiers "importants" indexés par chemin -> contenu
            directories: {},      // Dictionnaire des dossiers
            allFiles: [],         // Liste à plat de tous les fichiers
            allDirectories: [],   // Liste à plat de tous les dossiers
            fileContents: {},     // Tous contenus (pour analyse) indexés par chemin
            analysis: {
                projectPurpose: null,
                mainFeatures: [],
                technologyStack: [],
                architecture: null,
                complexity: 'simple'
            }
        };

        try {
            // Parcours récursif de tout le repo
            await this.crawlRepository(owner, repo, '', structure);
            
            // Analyse les fichiers récupérés pour inférer le purpose (but) du projet
            await this.analyzeAllFilesForPurpose(structure);
            
            console.log(`✅ Analyzed ${structure.allDirectories.length} directories and ${structure.allFiles.length} files`);
            console.log(`📊 Found ${Object.keys(structure.fileContents).length} files with content analysis`);
            return structure;
            
        } catch (error) {
            // Journalise et propage l'erreur si la structure ne peut être obtenue
            console.error('Error fetching repository structure:', error);
            throw error;
        }
    }

    // -----------------------------------------------------------------------
    // crawlRepository(owner, repo, currentPath, structure)
    // -----------------------------------------------------------------------
    // But: parcourir un chemin (dossier) du repo, lister son contenu via API
    // GitHub, et pour chaque élément:
    // - Descendre récursivement dans les sous-dossiers (sauf dossiers ignorés)
    // - Enregistrer les fichiers (sauf ignorés) et, si possible, récupérer leur
    //   contenu pour analyse ultérieure (base64 décodé)
    // 
    // Paramètres:
    // - owner, repo: repo GitHub
    // - currentPath: chemin courant (string, vide pour la racine)
    // - structure: objet d'accumulation des résultats
    // -----------------------------------------------------------------------
    async crawlRepository(owner, repo, currentPath, structure) {
        try {
            // Appel API GitHub: liste le contenu du répertoire courant
            const contents = await this.fetchDirectoryContents(owner, repo, currentPath);
            
            for (const item of contents) {
                console.log("item is: ", item.path);
                if (item.type === 'dir') {
                    // Ignore certains dossiers (build, cache, node_modules, etc.)
                    if (this.shouldSkipDirectory(item.path)) {
                        continue;
                    }
                    
                    // Ajoute le dossier aux collections
                    structure.allDirectories.push(item.path);
                    structure.directories[item.path] = [];
                    
                    // Descente récursive dans le sous-dossier
                    await this.crawlRepository(owner, repo, item.path, structure);
                } else if (item.type === 'file') {
                    // Ignore certains fichiers (trop gros, binaires, artefacts...)
                    if (this.shouldSkipFile(item.path, item.size)) {
                        continue;
                    }
                    
                    // Ajoute le fichier aux collections
                    structure.allFiles.push(item.path);
                    
                    // Récupère le contenu pour analyse
                    try {
                        const content = await this.fetchFileContent(owner, repo, item.path);
                        structure.fileContents[item.path] = content;
                        
                        // Mémorise séparément les fichiers jugés importants
                        if (this.isImportantFile(item.path)) {
                            structure.files[item.path] = content;
                        }
                    } catch (error) {
                        // Tolère l'échec pour certains fichiers
                        console.log(`⚠️ Could not fetch content for ${item.path}: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            // Si le dossier n'est pas accessible, on journalise et on continue
            console.log(`⚠️ Could not access ${currentPath}: ${error.message}`);
        }
    }

    // -----------------------------------------------------------------------
    // shouldSkipDirectory(dirPath)
    // -----------------------------------------------------------------------
    // But: indiquer si un dossier doit être ignoré (gains de performance et
    // pertinence: on ignore caches, builds, vendor, etc.).
    // -----------------------------------------------------------------------
    shouldSkipDirectory(dirPath) {
        const skipPatterns = [
            'node_modules', '.git', 'build', 'dist', 'out', '.next',
            'coverage', '.nyc_output', '.cache', 'tmp', 'temp',
            'vendor', 'bower_components', '.pnp'
        ];
        
        return skipPatterns.some(pattern => dirPath.includes(pattern));
    }

    // -----------------------------------------------------------------------
    // shouldSkipFile(filePath, fileSize)
    // -----------------------------------------------------------------------
    // But: indiquer si un fichier doit être ignoré (trop gros ou non pertinent
    // pour l'analyse textuelle: binaires, artefacts minifiés, archives...).
    // - fileSize > 1MB: ignore pour limiter les coûts de transfert
    // - extensions non textuelles: ignore
    // -----------------------------------------------------------------------
    shouldSkipFile(filePath, fileSize) {
        // Skip large files (over 1MB)
        if (fileSize > 1024 * 1024) {
            return true;
        }
        
        // Skip build artifacts and binary files
        const skipExtensions = [
            '.min.js', '.min.css', '.map', '.lock', '.log',
            '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
            '.woff', '.woff2', '.ttf', '.eot',
            '.zip', '.tar', '.gz', '.rar',
            '.exe', '.dll', '.so', '.dylib'
        ];
        
        return skipExtensions.some(ext => filePath.endsWith(ext));
    }

    // -----------------------------------------------------------------------
    // isImportantFile(filePath)
    // -----------------------------------------------------------------------
    // But: signaler si un fichier est important pour l'analyse (code, JSON,
    // README, env, Docker...). Ces fichiers seront priorisés pour lecture.
    // -----------------------------------------------------------------------
    isImportantFile(filePath) {
        const importantExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', '.yml', '.yaml', '.env'];
        const importantFiles = ['package.json', 'README.md', 'Dockerfile', 'docker-compose.yml', '.gitignore'];
        
        const extension = filePath.split('.').pop().toLowerCase();
        const fileName = filePath.split('/').pop();
        
        return importantExtensions.includes(`.${extension}`) || importantFiles.includes(fileName);
    }

    // -----------------------------------------------------------------------
    // analyzeAllFilesForPurpose(structure)
    // -----------------------------------------------------------------------
    // But: produit une analyse globale à partir des contenus collectés afin de
    // déduire: purpose (finalité), fonctionnalités, stack, architecture, complexité.
    // Étapes principales:
    // - Analyse `package.json` puis README
    // - Analyse des fichiers code (JS/TS)
    // - Analyse des fichiers de configuration
    // - Détermination de la complexité
    // - Nettoyage et dédoublonnage
    // -----------------------------------------------------------------------
    async analyzeAllFilesForPurpose(structure) {
        console.log('🔍 Analyzing all files for project purpose...');
        
        const analysis = {
            projectPurpose: null,
            mainFeatures: [],
            technologyStack: [],
            architecture: null,
            complexity: 'simple',
            description: null,
            keyFiles: []
        };

        // Analyse en priorité package.json (souvent le plus informatif)
        if (structure.fileContents['package.json']) {
            const pkgAnalysis = this.analyzePackageJson(structure.fileContents['package.json']);
            analysis.projectPurpose = pkgAnalysis.purpose;
            analysis.technologyStack = pkgAnalysis.technologies;
            analysis.description = pkgAnalysis.description;
        }

        // Analyse des README ou docs pour extraire but/description/features
        const readmeFiles = Object.keys(structure.fileContents).filter(f => 
            f.toLowerCase().includes('readme') || f.toLowerCase().includes('docs')
        );
        
        for (const readmeFile of readmeFiles) {
            const readmeAnalysis = this.analyzeReadmeFile(structure.fileContents[readmeFile]);
            if (readmeAnalysis.purpose && !analysis.projectPurpose) {
                analysis.projectPurpose = readmeAnalysis.purpose;
            }
            if (readmeAnalysis.description && !analysis.description) {
                analysis.description = readmeAnalysis.description;
            }
            analysis.mainFeatures.push(...readmeAnalysis.features);
        }

        // Analyse des fichiers de code (JS/TS) pour détecter fonctionnalités
        const codeFiles = Object.keys(structure.fileContents).filter(f => 
            f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.tsx')
        );

        for (const codeFile of codeFiles) {
            const codeAnalysis = this.analyzeCodeFile(structure.fileContents[codeFile], codeFile);
            analysis.mainFeatures.push(...codeAnalysis.features);
            
            if (codeAnalysis.purpose && !analysis.projectPurpose) {
                analysis.projectPurpose = codeAnalysis.purpose;
            }
            
            if (codeAnalysis.architecture && !analysis.architecture) {
                analysis.architecture = codeAnalysis.architecture;
            }
        }

        // Analyse des fichiers de configuration (config, env)
        const configFiles = Object.keys(structure.fileContents).filter(f => 
            f.includes('config') || f.includes('env') || f.includes('settings')
        );

        for (const configFile of configFiles) {
            const configAnalysis = this.analyzeConfigFile(structure.fileContents[configFile], configFile);
            analysis.mainFeatures.push(...configAnalysis.features);
            analysis.technologyStack.push(...configAnalysis.technologies);
        }

        // Détermination de la complexité globale selon le volume et l'organisation
        analysis.complexity = this.determineComplexity(structure);

        // Nettoyage (dé-duplication) et sélection de fichiers clés
        analysis.mainFeatures = [...new Set(analysis.mainFeatures)].filter(f => f);
        analysis.technologyStack = [...new Set(analysis.technologyStack)].filter(t => t);
        analysis.keyFiles = this.identifyKeyFiles(structure);

        structure.analysis = analysis;
        
        // Log d'informations clés de l'analyse globale
        console.log(`🎯 Project Purpose: ${analysis.projectPurpose || 'Unknown'}`);
        console.log(`🔧 Main Features: ${analysis.mainFeatures.slice(0, 5).join(', ')}${analysis.mainFeatures.length > 5 ? '...' : ''}`);
        console.log(`⚙️ Technologies: ${analysis.technologyStack.join(', ')}`);
        console.log(`🏗️ Architecture: ${analysis.architecture || 'Standard'}`);
        console.log(`📊 Complexity: ${analysis.complexity}`);
        
        return analysis;
    }

    // -----------------------------------------------------------------------
    // analyzePackageJson(content)
    // -----------------------------------------------------------------------
    // But: parser `package.json` et en extraire:
    // - technologies/dépendances majeures
    // - description du projet
    // - un indice de finalité via le nom du projet
    // -----------------------------------------------------------------------
    analyzePackageJson(content) {
        try {
            const pkg = JSON.parse(content);
            const analysis = {
                purpose: null,
                technologies: [],
                description: null
            };

            // Description directe depuis package.json
            analysis.description = pkg.description;

            // Détecte technologies via dépendances
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            
            if (deps['express']) analysis.technologies.push('Express.js', 'Node.js');
            if (deps['react']) analysis.technologies.push('React');
            if (deps['next']) analysis.technologies.push('Next.js');
            if (deps['mongoose']) analysis.technologies.push('MongoDB');
            if (deps['prisma']) analysis.technologies.push('Prisma');
            if (deps['typescript']) analysis.technologies.push('TypeScript');
            if (deps['tailwindcss']) analysis.technologies.push('Tailwind CSS');
            if (deps['jest']) analysis.technologies.push('Jest');
            if (deps['cypress']) analysis.technologies.push('Cypress');

            // Déduit la finalité depuis le nom du projet
            if (pkg.name) {
                analysis.purpose = this.analyzeProjectName(pkg.name);
            }

            return analysis;
        } catch (error) {
            // Si le JSON est invalide, renvoie une analyse vide
            return { purpose: null, technologies: [], description: null };
        }
    }

    // -----------------------------------------------------------------------
    // analyzeReadmeFile(content)
    // -----------------------------------------------------------------------
    // But: heuristiques sur README pour extraire un but, une description et
    // quelques features typiques (ex: budget => finance, e-commerce => shop...).
    // -----------------------------------------------------------------------
    analyzeReadmeFile(content) {
        const analysis = {
            purpose: null,
            description: null,
            features: []
        };

        const contentLower = content.toLowerCase();

        // Indices de domaine/finalité courants dans les READMEs
        if (contentLower.includes('budget') || contentLower.includes('finance') || contentLower.includes('money')) {
            analysis.purpose = 'Financial Management Application';
            analysis.features.push('Budget Tracking', 'Financial Planning');
        }
        
        if (contentLower.includes('e-commerce') || contentLower.includes('shop') || contentLower.includes('store')) {
            analysis.purpose = 'E-commerce Application';
            analysis.features.push('Online Shopping', 'Product Management');
        }
        
        if (contentLower.includes('social') || contentLower.includes('chat') || contentLower.includes('messaging')) {
            analysis.purpose = 'Social/Communication Application';
            analysis.features.push('Social Networking', 'Messaging');
        }
        
        if (contentLower.includes('task') || contentLower.includes('todo') || contentLower.includes('project')) {
            analysis.purpose = 'Task/Project Management Application';
            analysis.features.push('Task Management', 'Project Tracking');
        }
        
        if (contentLower.includes('api') || contentLower.includes('backend') || contentLower.includes('server')) {
            analysis.purpose = 'Backend API Service';
            analysis.features.push('REST API', 'Backend Services');
        }

        // Première ligne non vide comme description basique
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.trim() && !line.startsWith('#') && !line.startsWith('[')) {
                analysis.description = line.trim();
                break;
            }
        }

        return analysis;
    }

    // -----------------------------------------------------------------------
    // analyzeCodeFile(content, filePath)
    // -----------------------------------------------------------------------
    // But: heuristiques sur le contenu des fichiers code pour inférer features,
    // architecture (Express backend, React frontend...), et éventuellement but.
    // -----------------------------------------------------------------------
    analyzeCodeFile(content, filePath) {
        const analysis = {
            purpose: null,
            features: [],
            architecture: null
        };

        const contentLower = content.toLowerCase();
        const fileName = filePath.toLowerCase();

        // Heuristiques basées sur contenu
        if (contentLower.includes('express') && contentLower.includes('app')) {
            analysis.architecture = 'Express.js Backend';
        }
        
        if (contentLower.includes('react') || contentLower.includes('jsx')) {
            analysis.architecture = 'React Frontend';
        }
        
        if (contentLower.includes('mongoose') || contentLower.includes('mongodb')) {
            analysis.features.push('MongoDB Database');
        }
        
        if (contentLower.includes('budget') || contentLower.includes('finance')) {
            analysis.purpose = 'Financial Management';
            analysis.features.push('Budget Tracking');
        }
        
        if (contentLower.includes('transaction')) {
            analysis.features.push('Transaction Management');
        }
        
        if (contentLower.includes('scheduled') || contentLower.includes('cron')) {
            analysis.features.push('Scheduled Tasks');
        }
        
        if (contentLower.includes('auth') || contentLower.includes('login')) {
            analysis.features.push('User Authentication');
        }
        
        if (contentLower.includes('route') || contentLower.includes('api')) {
            analysis.features.push('API Endpoints');
        }

        // Heuristiques basées sur le nom du fichier
        if (fileName.includes('budget') || fileName.includes('finance')) {
            analysis.purpose = 'Financial Management';
        }
        
        if (fileName.includes('auth') || fileName.includes('user')) {
            analysis.features.push('User Management');
        }
        
        if (fileName.includes('transaction')) {
            analysis.features.push('Transaction Processing');
        }

        return analysis;
    }

    // -----------------------------------------------------------------------
    // analyzeConfigFile(content, filePath)
    // -----------------------------------------------------------------------
    // But: heuristiques sur fichiers de configuration (MongoDB, Express/CORS,
    // Auth/JWT...) pour enrichir technologies et features.
    // -----------------------------------------------------------------------
    analyzeConfigFile(content, filePath) {
        const analysis = {
            features: [],
            technologies: []
        };

        const contentLower = content.toLowerCase();
        const fileName = filePath.toLowerCase();

        if (contentLower.includes('mongodb') || contentLower.includes('mongo')) {
            analysis.technologies.push('MongoDB');
            analysis.features.push('Database Configuration');
        }
        
        if (contentLower.includes('express') || contentLower.includes('cors')) {
            analysis.technologies.push('Express.js');
            analysis.features.push('Server Configuration');
        }
        
        if (contentLower.includes('auth') || contentLower.includes('jwt')) {
            analysis.features.push('Authentication Configuration');
        }

        return analysis;
    }

    // -----------------------------------------------------------------------
    // analyzeProjectName(name)
    // -----------------------------------------------------------------------
    // But: déduire une finalité approximative à partir du nom du projet.
    // -----------------------------------------------------------------------
    analyzeProjectName(name) {
        const nameLower = name.toLowerCase();
        
        if (nameLower.includes('budget') || nameLower.includes('finance') || nameLower.includes('money')) {
            return 'Financial Management Application';
        }
        
        if (nameLower.includes('shop') || nameLower.includes('store') || nameLower.includes('ecommerce')) {
            return 'E-commerce Application';
        }
        
        if (nameLower.includes('social') || nameLower.includes('chat')) {
            return 'Social/Communication Application';
        }
        
        if (nameLower.includes('task') || nameLower.includes('todo')) {
            return 'Task Management Application';
        }
        
        if (nameLower.includes('api') || nameLower.includes('backend')) {
            return 'Backend API Service';
        }
        
        return null;
    }

    // -----------------------------------------------------------------------
    // determineComplexity(structure)
    // -----------------------------------------------------------------------
    // But: classifier globalement la complexité (simple/modérée/complexe)
    // selon le nombre de fichiers et dossiers.
    // -----------------------------------------------------------------------
    determineComplexity(structure) {
        const totalFiles = structure.allFiles.length;
        const totalDirs = structure.allDirectories.length;
        
        if (totalFiles > 50 || totalDirs > 15) {
            return 'complex';
        } else if (totalFiles > 20 || totalDirs > 8) {
            return 'moderate';
        } else {
            return 'simple';
        }
    }

    // -----------------------------------------------------------------------
    // identifyKeyFiles(structure)
    // -----------------------------------------------------------------------
    // But: lister les fichiers clés (config, points d'entrée, docs) pour fournir
    // un aperçu rapide aux développeurs et aux rapports d'insights.
    // -----------------------------------------------------------------------
    identifyKeyFiles(structure) {
        const keyFiles = [];
        
        // Fichiers de configuration importants
        const configFiles = structure.allFiles.filter(f => 
            f.includes('package.json') || f.includes('config') || f.includes('env')
        );
        keyFiles.push(...configFiles);
        
        // Points d'entrée courants des applis
        const entryFiles = structure.allFiles.filter(f => 
            f.includes('index.js') || f.includes('app.js') || f.includes('server.js') ||
            f.includes('main.js') || f.includes('App.jsx') || f.includes('App.tsx')
        );
        keyFiles.push(...entryFiles);
        
        // Documentation
        const docFiles = structure.allFiles.filter(f => 
            f.includes('readme') || f.includes('docs')
        );
        keyFiles.push(...docFiles);
        
        return [...new Set(keyFiles)];
    }

    // -----------------------------------------------------------------------
    // analyzeProjectPurpose(structure)
    // -----------------------------------------------------------------------
    // But: produire un objet `purpose` détaillé (domaine, type, complexité,
    // cible, confiance, description, features, technologies, fichiers clés) en
    // se basant sur `structure.analysis` alimenté précédemment.
    // -----------------------------------------------------------------------
    async analyzeProjectPurpose(structure) {
        console.log('🎯 Analyzing project purpose...');
        
        // Réutilise l'analyse complète déjà effectuée
        const analysis = structure.analysis;
        
        const purpose = {
            domain: analysis.projectPurpose || 'Unknown Application',
            type: analysis.architecture || 'Custom Application',
            complexity: analysis.complexity,
            target: 'General Users',
            confidence: 0.7,
            description: analysis.description,
            features: analysis.mainFeatures,
            technologies: analysis.technologyStack,
            keyFiles: analysis.keyFiles
        };

        // Calcule une confiance basée sur la richesse des informations
        let confidence = 0.3; // Base
        
        if (analysis.projectPurpose) confidence += 0.3;
        if (analysis.description) confidence += 0.2;
        if (analysis.mainFeatures.length > 0) confidence += 0.1;
        if (analysis.technologyStack.length > 0) confidence += 0.1;
        
        purpose.confidence = Math.min(1, confidence);

        // Construit une conclusion textuelle résumant le tout
        let conclusion = '';
        
        if (analysis.projectPurpose) {
            conclusion = `This is a ${analysis.projectPurpose.toLowerCase()}`;
        } else if (analysis.architecture) {
            conclusion = `This is a ${analysis.architecture.toLowerCase()}`;
        } else {
            conclusion = 'This is a custom application';
        }
        
        if (analysis.mainFeatures.length > 0) {
            conclusion += ` that provides ${analysis.mainFeatures.slice(0, 3).join(', ')}`;
        }
        
        if (analysis.technologyStack.length > 0) {
            conclusion += `. Built with ${analysis.technologyStack.join(', ')}`;
        }
        
        conclusion += `. The project has ${analysis.complexity} complexity.`;
        
        purpose.conclusion = conclusion;

        console.log(`✅ Project Purpose: ${purpose.domain} (${purpose.complexity} complexity)`);
        if (purpose.description) {
            console.log(`📝 Description: ${purpose.description}`);
        }
        if (purpose.features.length > 0) {
            console.log(`🔧 Features: ${purpose.features.slice(0, 5).join(', ')}${purpose.features.length > 5 ? '...' : ''}`);
        }
        console.log(`💡 Conclusion: ${purpose.conclusion}`);
        
        return purpose;
    }

    // -----------------------------------------------------------------------
    // analyzeArchitecture(structure)
    // -----------------------------------------------------------------------
    // But: détecter des patterns d'architecture (Next.js, MVC, layered...) et
    // qualifier la qualité via plusieurs sous-analyses (couches, patterns, orga).
    // -----------------------------------------------------------------------
    async analyzeArchitecture(structure) {
        console.log('🏗️ Analyzing architecture patterns...');
        
        const architecture = {
            pattern: null,   // Nom du pattern principal
            layers: [],      // Couches détectées (Presentation, Business, Data...)
            patterns: [],    // Design patterns (Repository, Factory, Observer...)
            quality: 0,      // Score qualité architecture
            strengths: [],   // Points forts
            weaknesses: [],  // Points faibles
            structure: {}
        };

        // Détecte un pattern global d'architecture à partir de l'arborescence
        architecture.pattern = this.detectArchitecturePattern(structure);
        
        // Analyse la séparation des couches
        architecture.layers = this.analyzeLayerSeparation(structure);
        
        // Détecte des design patterns
        architecture.patterns = this.detectDesignPatterns(structure);
        
        // Analyse l'organisation des fichiers
        architecture.structure = this.analyzeFileOrganization(structure);
        
        // Évalue la qualité architecturale (forces/faiblesses)
        const qualityAnalysis = this.analyzeArchitecturalQuality(structure, architecture);
        architecture.quality = qualityAnalysis.score;
        architecture.strengths = qualityAnalysis.strengths;
        architecture.weaknesses = qualityAnalysis.weaknesses;

        console.log(`✅ Architecture: ${architecture.pattern} (Quality: ${architecture.quality}/10)`);
        return architecture;
    }

    // -----------------------------------------------------------------------
    // detectArchitecturePattern(structure)
    // -----------------------------------------------------------------------
    // But: heuristiques pour deviner un pattern d'architecture global depuis
    // la liste des dossiers/fichiers (Next.js app/pages, MVC, microservices...).
    // -----------------------------------------------------------------------
    detectArchitecturePattern(structure) {
        const dirs = structure.allDirectories.map(d => d.toLowerCase());
        const files = structure.allFiles.map(f => f.toLowerCase());

        // Next.js (App Router)
        if (dirs.some(d => d.includes('app'))) {
            return 'App Router (Next.js 13+)';
        }
        // Next.js (Pages Router)
        if (dirs.some(d => d.includes('pages'))) {
            return 'Pages Router (Next.js)';
        }

        // React (présence de src + fichiers mentionnant react)
        if (dirs.some(d => d.includes('src')) && files.some(f => f.includes('react'))) {
            return 'React Component-Based';
        }

        // MVC (modèles/contrôleurs/vues)
        if (dirs.some(d => d.includes('controllers') || d.includes('models') || d.includes('views'))) {
            return 'MVC (Model-View-Controller)';
        }

        // Architecture en couches (services + controllers)
        if (dirs.some(d => d.includes('services')) && dirs.some(d => d.includes('controllers'))) {
            return 'Layered Architecture';
        }

        // Express.js REST API (express + routes)
        if (files.some(f => f.includes('express')) && files.some(f => f.includes('route'))) {
            return 'Express.js REST API';
        }

        // Microservices (services + docker)
        if (dirs.some(d => d.includes('services')) && files.some(f => f.includes('docker'))) {
            return 'Microservices Architecture';
        }

        return 'Custom Architecture';
    }

    // -----------------------------------------------------------------------
    // analyzeFileOrganization(structure)
    // -----------------------------------------------------------------------
    // But: catégoriser l'organisation des fichiers (racine, config, docs, tests,
    // déploiement) et, si `src/` existe, relever les sous-dossiers clés.
    // -----------------------------------------------------------------------
    analyzeFileOrganization(structure) {
        const organization = {
            rootFiles: [],
            srcStructure: {},
            configFiles: [],
            documentation: [],
            testing: [],
            deployment: []
        };

        // Catégorisation par mot-clé dans le chemin
        for (const file of structure.allFiles) {
            const fileName = file.toLowerCase();
            
            if (file.split('/').length === 1) {
                organization.rootFiles.push(file);
            }
            
            if (fileName.includes('config') || fileName.includes('env') || fileName.includes('docker')) {
                organization.configFiles.push(file);
            }
            
            if (fileName.includes('readme') || fileName.includes('docs') || fileName.includes('license')) {
                organization.documentation.push(file);
            }
            
            if (fileName.includes('test') || fileName.includes('spec') || fileName.includes('jest')) {
                organization.testing.push(file);
            }
            
            if (fileName.includes('docker') || fileName.includes('deploy') || fileName.includes('workflow')) {
                organization.deployment.push(file);
            }
        }

        // Analyse spécifique si une structure src/ est présente
        const srcDirs = structure.allDirectories.filter(d => d.startsWith('src/'));
        if (srcDirs.length > 0) {
            organization.srcStructure = {
                components: srcDirs.filter(d => d.includes('component')),
                services: srcDirs.filter(d => d.includes('service')),
                utils: srcDirs.filter(d => d.includes('util')),
                types: srcDirs.filter(d => d.includes('type')),
                hooks: srcDirs.filter(d => d.includes('hook')),
                pages: srcDirs.filter(d => d.includes('page')),
                assets: srcDirs.filter(d => d.includes('asset'))
            };
        }

        return organization;
    }

    // -----------------------------------------------------------------------
    // analyzeCoherence(structure)
    // -----------------------------------------------------------------------
    // But: calculer des sous-scores de cohérence (naming/structure/patterns) et
    // produire un score global.
    // -----------------------------------------------------------------------
    async analyzeCoherence(structure) {
        console.log('🔗 Analyzing code coherence...');
        
        const coherence = {
            consistency: 0, // Score global
            naming: 0,      // Cohérence des noms de fichiers/dossiers
            structure: 0,   // Cohérence de la profondeur / regroupements
            patterns: 0     // Cohérence des patterns (extensions, groupes...)
        };

        // Cohérence de nommage
        coherence.naming = this.analyzeNamingConsistency(structure);
        
        // Cohérence structurelle
        coherence.structure = this.analyzeStructuralConsistency(structure);
        
        // Cohérence des patterns
        coherence.patterns = this.analyzePatternConsistency(structure);
        
        // Moyenne des sous-scores
        coherence.consistency = (coherence.naming + coherence.structure + coherence.patterns) / 3;

        console.log(`✅ Coherence: ${coherence.consistency.toFixed(1)}/10 (Naming: ${coherence.naming.toFixed(1)}, Structure: ${coherence.structure.toFixed(1)}, Patterns: ${coherence.patterns.toFixed(1)})`);
        return coherence;
    }

    // -----------------------------------------------------------------------
    // analyzeNamingConsistency(structure)
    // -----------------------------------------------------------------------
    // But: vérifier la cohérence de nommage des fichiers et dossiers (camelCase,
    // kebab-case, snake_case) et attribuer un score.
    // -----------------------------------------------------------------------
    analyzeNamingConsistency(structure) {
        let score = 5;
        const fileNames = structure.allFiles.map(f => f.split('/').pop().toLowerCase());
        const dirNames = structure.allDirectories.map(d => d.split('/').pop().toLowerCase());

        // Compte par extensions
        const jsFiles = fileNames.filter(f => f.endsWith('.js'));
        const tsFiles = fileNames.filter(f => f.endsWith('.ts'));
        const jsxFiles = fileNames.filter(f => f.endsWith('.jsx'));
        const tsxFiles = fileNames.filter(f => f.endsWith('.tsx'));

        // Détection de conventions de casse courantes
        const camelCaseFiles = fileNames.filter(f => /^[a-z][a-zA-Z0-9]*\.(js|ts|jsx|tsx)$/.test(f));
        const kebabCaseFiles = fileNames.filter(f => /^[a-z][a-z0-9-]*\.(js|ts|jsx|tsx)$/.test(f));
        const snakeCaseFiles = fileNames.filter(f => /^[a-z][a-z0-9_]*\.(js|ts|jsx|tsx)$/.test(f));

        const totalFiles = jsFiles.length + tsFiles.length + jsxFiles.length + tsxFiles.length;
        if (totalFiles > 0) {
            const consistentFiles = Math.max(camelCaseFiles.length, kebabCaseFiles.length, snakeCaseFiles.length);
            const consistencyRatio = consistentFiles / totalFiles;
            
            if (consistencyRatio >= 0.8) {
                score += 3;
            } else if (consistencyRatio >= 0.6) {
                score += 2;
            } else if (consistencyRatio >= 0.4) {
                score += 1;
            }
        }

        // Même logique pour les dossiers
        const camelCaseDirs = dirNames.filter(d => /^[a-z][a-zA-Z0-9]*$/.test(d));
        const kebabCaseDirs = dirNames.filter(d => /^[a-z][a-z0-9-]*$/.test(d));
        const snakeCaseDirs = dirNames.filter(d => /^[a-z][a-z0-9_]*$/.test(d));

        if (dirNames.length > 0) {
            const consistentDirs = Math.max(camelCaseDirs.length, kebabCaseDirs.length, snakeCaseDirs.length);
            const consistencyRatio = consistentDirs / dirNames.length;
            
            if (consistencyRatio >= 0.8) {
                score += 2;
            } else if (consistencyRatio >= 0.6) {
                score += 1;
            }
        }

        return Math.min(10, Math.max(0, score));
    }

    // -----------------------------------------------------------------------
    // analyzeStructuralConsistency(structure)
    // -----------------------------------------------------------------------
    // But: analyser la cohérence de profondeur des dossiers et des regroupements
    // logiques (components/services/utils/config...).
    // -----------------------------------------------------------------------
    analyzeStructuralConsistency(structure) {
        let score = 5;
        const dirs = structure.allDirectories;

        // Mesure la variance de profondeur des dossiers
        const depths = dirs.map(d => d.split('/').length);
        const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
        const depthVariance = depths.reduce((sum, depth) => sum + Math.pow(depth - avgDepth, 2), 0) / depths.length;

        if (depthVariance < 1) {
            score += 2; // Très cohérent
        } else if (depthVariance < 2) {
            score += 1; // Moderément cohérent
        }

        // Regroupements logiques courants
        const hasComponents = dirs.some(d => d.includes('components'));
        const hasServices = dirs.some(d => d.includes('services'));
        const hasUtils = dirs.some(d => d.includes('utils'));
        const hasConfig = dirs.some(d => d.includes('config'));

        const logicalGroups = [hasComponents, hasServices, hasUtils, hasConfig].filter(Boolean).length;
        if (logicalGroups >= 3) {
            score += 2;
        } else if (logicalGroups >= 2) {
            score += 1;
        }

        // Vérifie que les dossiers contiennent effectivement des fichiers
        const organizedDirs = dirs.filter(dir => {
            const filesInDir = structure.allFiles.filter(file => file.startsWith(dir + '/'));
            return filesInDir.length > 0;
        });

        if (organizedDirs.length >= 3) {
            score += 1;
        }

        return Math.min(10, Math.max(0, score));
    }

    // -----------------------------------------------------------------------
    // analyzePatternConsistency(structure)
    // -----------------------------------------------------------------------
    // But: cohérence des types de fichiers (extensions dominantes), grouping de
    // fichiers similaires, et cohérence de config.
    // -----------------------------------------------------------------------
    analyzePatternConsistency(structure) {
        let score = 5;
        const files = structure.allFiles;

        // Cohérence des extensions dominantes
        const extensions = files.map(f => f.split('.').pop().toLowerCase());
        const extensionCounts = {};
        extensions.forEach(ext => {
            extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
        });

        const totalFiles = files.length;
        const dominantExtension = Object.keys(extensionCounts).reduce((a, b) => 
            extensionCounts[a] > extensionCounts[b] ? a : b
        );
        const dominantRatio = extensionCounts[dominantExtension] / totalFiles;

        if (dominantRatio >= 0.7) {
            score += 2; // Très cohérent
        } else if (dominantRatio >= 0.5) {
            score += 1; // Moderément cohérent
        }

        // Grouping JS/TS
        const jsFiles = files.filter(f => f.endsWith('.js'));
        const tsFiles = files.filter(f => f.endsWith('.ts'));
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        const mdFiles = files.filter(f => f.endsWith('.md'));

        // Vérifie un grouping relativement cohérent entre JS et TS
        const hasConsistentGrouping = (jsFiles.length > 0 && tsFiles.length === 0) || 
                                    (tsFiles.length > 0 && jsFiles.length === 0) ||
                                    (jsFiles.length > 0 && tsFiles.length > 0 && Math.abs(jsFiles.length - tsFiles.length) < 3);

        if (hasConsistentGrouping) {
            score += 2;
        }

        // Cohérence des fichiers de config
        const configFiles = files.filter(f => f.includes('config') || f.includes('env'));
        if (configFiles.length > 0 && configFiles.every(f => f.includes('config') || f.includes('env'))) {
            score += 1;
        }

        return Math.min(10, Math.max(0, score));
    }

    // -----------------------------------------------------------------------
    // analyzeCodeQuality(structure)
    // -----------------------------------------------------------------------
    // But: calculer des sous-scores (maintenabilité, lisibilité, performance,
    // sécurité, testabilité) puis un score global de qualité.
    // -----------------------------------------------------------------------
    async analyzeCodeQuality(structure) {
        console.log('📊 Analyzing code quality...');
        
        const quality = {
            overall: 0,
            maintainability: 0,
            readability: 0,
            performance: 0,
            security: 0,
            testability: 0
        };

        // Sous-scores via sous-analyses dédiées
        quality.maintainability = this.analyzeMaintainability(structure);
        
        quality.readability = this.analyzeReadability(structure);
        
        quality.performance = this.analyzePerformance(structure);
        
        quality.security = this.analyzeSecurity(structure);
        
        quality.testability = this.analyzeTestability(structure);
        
        // Score global = moyenne simple
        quality.overall = (quality.maintainability + quality.readability + quality.performance + quality.security + quality.testability) / 5;

        console.log(`✅ Code Quality: ${quality.overall.toFixed(1)}/10 (Maintainability: ${quality.maintainability.toFixed(1)}, Readability: ${quality.readability.toFixed(1)})`);
        return quality;
    }

    // -----------------------------------------------------------------------
    // analyzeMaintainability(structure)
    // -----------------------------------------------------------------------
    // But: heuristiques liées à la modularité, séparation des responsabilités,
    // présence de config et documentation.
    // -----------------------------------------------------------------------
    analyzeMaintainability(structure) {
        let score = 5;
        
        // Modularité (components/services/utils/modules)
        const modularDirs = structure.allDirectories.filter(dir => 
            dir.includes('components') || dir.includes('services') || 
            dir.includes('utils') || dir.includes('modules')
        );
        if (modularDirs.length >= 3) score += 2;
        else if (modularDirs.length >= 1) score += 1;
        
        // Séparation des responsabilités
        const hasComponents = structure.allDirectories.some(d => d.includes('components'));
        const hasServices = structure.allDirectories.some(d => d.includes('services'));
        const hasUtils = structure.allDirectories.some(d => d.includes('utils'));
        if (hasComponents && hasServices) score += 2;
        if (hasUtils) score += 1;
        
        // Fichiers de configuration
        const configFiles = structure.allFiles.filter(f => 
            f.includes('config') || f.includes('env') || f.includes('settings')
        );
        if (configFiles.length >= 2) score += 1;
        
        // Documentation
        const docFiles = structure.allFiles.filter(f => 
            f.includes('readme') || f.includes('docs') || f.includes('api')
        );
        if (docFiles.length >= 1) score += 1;
        
        return Math.min(10, Math.max(0, score));
    }

    // -----------------------------------------------------------------------
    // analyzeReadability(structure)
    // -----------------------------------------------------------------------
    // But: heuristiques de lisibilité (docs présentes, noms de dossiers clairs,
    // organisation des fichiers en sous-dossiers, présence de commentaires).
    // -----------------------------------------------------------------------
    analyzeReadability(structure) {
        let score = 5;
        
        // Documentation
        const docFiles = structure.allFiles.filter(f => 
            f.includes('readme') || f.includes('docs') || f.includes('license')
        );
        if (docFiles.length >= 1) score += 2;
        
        // Noms de dossiers courts et sans caractères spéciaux
        const clearNames = structure.allDirectories.filter(dir => {
            const dirName = dir.split('/').pop();
            return dirName.length <= 15 && !dirName.includes('_') && !dirName.includes('-');
        });
        if (clearNames.length >= structure.allDirectories.length * 0.8) score += 2;
        else if (clearNames.length >= structure.allDirectories.length * 0.6) score += 1;
        
        // Organisation des fichiers (présence de répertoires)
        const organizedFiles = structure.allFiles.filter(file => {
            const parts = file.split('/');
            return parts.length >= 2; // Fichier placé dans un dossier
        });
        if (organizedFiles.length >= structure.allFiles.length * 0.8) score += 1;
        
        // Présence de commentaires dans les fichiers dont on a le contenu
        const filesWithContent = Object.keys(structure.files);
        if (filesWithContent.length > 0) {
            let filesWithComments = 0;
            for (const filePath of filesWithContent) {
                const content = structure.files[filePath];
                if (content && (content.includes('//') || content.includes('/*') || content.includes('#'))) {
                    filesWithComments++;
                }
            }
            if (filesWithComments >= filesWithContent.length * 0.5) score += 1;
        }
        
        return Math.min(10, Math.max(0, score));
    }

    // -----------------------------------------------------------------------
    // analyzePerformance(structure)
    // -----------------------------------------------------------------------
    // But: détecter outils/perfs (webpack/vite/babel, compression/cache) et
    // dépendances associées dans package.json.
    // -----------------------------------------------------------------------
    analyzePerformance(structure) {
        let score = 5;
        
        // Fichiers de config liés aux performances ou au build
        const perfFiles = structure.allFiles.filter(f => 
            f.includes('webpack') || f.includes('vite') || f.includes('babel') ||
            f.includes('compression') || f.includes('cache')
        );
        if (perfFiles.length >= 1) score += 2;
        
        // Vérifie la présence de paquets optimisant le build/perf
        if (structure.files['package.json']) {
            try {
                const pkg = JSON.parse(structure.files['package.json']);
                const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                
                if (deps['webpack'] || deps['vite']) score += 2; // Outils de build
                if (deps['compression'] || deps['gzip']) score += 1; // Compression
                if (deps['cache-manager'] || deps['redis']) score += 1; // Cache
            } catch (error) {
                // Ignore parsing errors
            }
        }
        
        return Math.min(10, Math.max(0, score));
    }

    // -----------------------------------------------------------------------
    // analyzeSecurity(structure)
    // -----------------------------------------------------------------------
    // But: détecter des éléments de sécurité (helmet/cors/bcrypt/jwt/rate-limit)
    // dans les fichiers et dépendances.
    // -----------------------------------------------------------------------
    analyzeSecurity(structure) {
        let score = 5;
        
        // Indices de sécurité dans les chemins de fichiers
        const securityFiles = structure.allFiles.filter(f => 
            f.includes('helmet') || f.includes('cors') || f.includes('bcrypt') ||
            f.includes('jwt') || f.includes('auth') || f.includes('rate-limit')
        );
        if (securityFiles.length >= 1) score += 2;
        
        // Paquets sécurité dans package.json
        if (structure.files['package.json']) {
            try {
                const pkg = JSON.parse(structure.files['package.json']);
                const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                
                if (deps['helmet'] || deps['cors']) score += 2; // Middleware sécurité
                if (deps['bcrypt'] || deps['jsonwebtoken']) score += 1; // Auth
                if (deps['express-rate-limit']) score += 1; // Limitation de débit
            } catch (error) {
                // Ignore parsing errors
            }
        }
        
        return Math.min(10, Math.max(0, score));
    }

    // -----------------------------------------------------------------------
    // analyzeTestability(structure)
    // -----------------------------------------------------------------------
    // But: vérifier la présence d'infra de tests (fichiers et packages Jest,
    // Mocha, Cypress, Playwright...), dossiers de tests, etc.
    // -----------------------------------------------------------------------
    analyzeTestability(structure) {
        let score = 5;
        
        // Fichiers indicateurs de tests
        const testFiles = structure.allFiles.filter(f => 
            f.includes('test') || f.includes('spec') || f.includes('jest') ||
            f.includes('mocha') || f.includes('cypress') || f.includes('playwright')
        );
        if (testFiles.length >= 1) score += 2;
        
        // Dossiers de tests
        const testDirs = structure.allDirectories.filter(d => 
            d.includes('test') || d.includes('spec') || d.includes('__tests__')
        );
        if (testDirs.length >= 1) score += 1;
        
        // Paquets de tests dans package.json
        if (structure.files['package.json']) {
            try {
                const pkg = JSON.parse(structure.files['package.json']);
                const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                
                if (deps['jest'] || deps['mocha']) score += 2; // Framework de tests
                if (deps['cypress'] || deps['playwright']) score += 1; // E2E
                if (deps['@testing-library']) score += 1; // Utilitaires de tests
            } catch (error) {
                // Ignore parsing errors
            }
        }
        
        return Math.min(10, Math.max(0, score));
    }

    // -----------------------------------------------------------------------
    // generateInsights(structure, purpose, architecture, coherence, quality)
    // -----------------------------------------------------------------------
    // But: générer une liste d'insights (compréhension, forces, faiblesses,
    // informations, recommandations spécifiques) en se basant sur les analyses.
    // -----------------------------------------------------------------------
    async generateInsights(structure, purpose, architecture, coherence, quality) {
        console.log('💡 Generating intelligent insights...');
        
        const insights = [];

        // Insights sur le but avec conclusion claire
        if (purpose.conclusion) {
            insights.push({
                type: 'purpose',
                title: 'Project Purpose Identified',
                message: purpose.conclusion,
                confidence: purpose.confidence,
                category: 'understanding'
            });
        } else if (purpose.confidence >= 0.5) {
            insights.push({
                type: 'purpose',
                title: 'Project Purpose Identified',
                message: `This appears to be a ${purpose.type} focused on ${purpose.domain}. The project shows ${purpose.complexity} complexity and targets ${purpose.target}.`,
                confidence: purpose.confidence,
                category: 'understanding'
            });
        } else {
            insights.push({
                type: 'purpose',
                title: 'Project Purpose Unclear',
                message: 'The project purpose is not clearly defined. Consider adding better documentation and project description.',
                confidence: 0.3,
                category: 'improvement'
            });
        }

        // Stack technologique
        if (purpose.technologies && purpose.technologies.length > 0) {
            insights.push({
                type: 'technology',
                title: 'Technology Stack Identified',
                message: `Uses: ${purpose.technologies.join(', ')}`,
                confidence: 0.9,
                category: 'information'
            });
        }

        // Features principales
        if (purpose.features && purpose.features.length > 0) {
            insights.push({
                type: 'features',
                title: 'Main Features Identified',
                message: `Provides: ${purpose.features.slice(0, 5).join(', ')}${purpose.features.length > 5 ? ' and more...' : ''}`,
                confidence: 0.8,
                category: 'information'
            });
        }

        // Architecture: forces/faiblesses
        if (architecture.quality >= 7) {
            insights.push({
                type: 'architecture',
                title: 'Strong Architecture',
                message: `The project uses ${architecture.pattern} with good separation of concerns and design patterns.`,
                confidence: architecture.quality / 10,
                category: 'strength'
            });
        } else {
            insights.push({
                type: 'architecture',
                title: 'Architecture Needs Improvement',
                message: `Consider improving the ${architecture.pattern} with better separation of concerns.`,
                confidence: architecture.quality / 10,
                category: 'improvement'
            });
        }

        // Cohérence
        if (coherence.consistency >= 7) {
            insights.push({
                type: 'coherence',
                title: 'Consistent Codebase',
                message: 'The codebase shows good consistency in naming, structure, and patterns.',
                confidence: coherence.consistency / 10,
                category: 'strength'
            });
        } else {
            insights.push({
                type: 'coherence',
                title: 'Inconsistent Code Patterns',
                message: 'The codebase has inconsistencies that could impact maintainability.',
                confidence: coherence.consistency / 10,
                category: 'improvement'
            });
        }

        // Qualité globale
        if (quality.overall >= 7) {
            insights.push({
                type: 'quality',
                title: 'High Code Quality',
                message: 'The codebase demonstrates good quality across maintainability, readability, and other dimensions.',
                confidence: quality.overall / 10,
                category: 'strength'
            });
        } else {
            insights.push({
                type: 'quality',
                title: 'Quality Improvements Needed',
                message: 'Several quality dimensions need attention for better code maintainability.',
                confidence: quality.overall / 10,
                category: 'improvement'
            });
        }

        // Taille/complexité de la structure
        const totalFiles = structure.allFiles.length;
        const totalDirs = structure.allDirectories.length;
        
        if (totalFiles > 20) {
            insights.push({
                type: 'structure',
                title: 'Complex Project Structure',
                message: `The project contains ${totalFiles} files across ${totalDirs} directories, indicating a substantial codebase.`,
                confidence: 0.8,
                category: 'information'
            });
        } else if (totalFiles > 5) {
            insights.push({
                type: 'structure',
                title: 'Moderate Project Size',
                message: `The project contains ${totalFiles} files across ${totalDirs} directories, suitable for a focused application.`,
                confidence: 0.7,
                category: 'information'
            });
        } else {
            insights.push({
                type: 'structure',
                title: 'Simple Project Structure',
                message: `The project contains ${totalFiles} files, indicating a simple or early-stage application.`,
                confidence: 0.6,
                category: 'information'
            });
        }

        // Fichiers clés
        if (purpose.keyFiles && purpose.keyFiles.length > 0) {
            insights.push({
                type: 'structure',
                title: 'Key Files Identified',
                message: `Main files: ${purpose.keyFiles.slice(0, 3).join(', ')}${purpose.keyFiles.length > 3 ? '...' : ''}`,
                confidence: 0.8,
                category: 'information'
            });
        }

        // Recommandations spécifiques (documentation, testing, sécurité, config...)
        const recommendations = this.generateSpecificRecommendations(structure, purpose, architecture, coherence, quality);
        insights.push(...recommendations);

        console.log(`✅ Generated ${insights.length} intelligent insights`);
        return insights;
    }

    // -----------------------------------------------------------------------
    // analyzeTechnologyStack(structure)
    // -----------------------------------------------------------------------
    // But: extraire un inventaire rapide des technologies via package.json
    // et extensions de fichiers.
    // -----------------------------------------------------------------------
    analyzeTechnologyStack(structure) {
        const stack = [];
        
        // Analyse de package.json
        if (structure.files['package.json']) {
            try {
                const pkg = JSON.parse(structure.files['package.json']);
                const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                
                if (deps['express']) stack.push('Express.js');
                if (deps['react']) stack.push('React');
                if (deps['next']) stack.push('Next.js');
                if (deps['mongoose']) stack.push('MongoDB');
                if (deps['prisma']) stack.push('Prisma');
                if (deps['typescript']) stack.push('TypeScript');
                if (deps['tailwindcss']) stack.push('Tailwind CSS');
                if (deps['jest']) stack.push('Jest');
                if (deps['cypress']) stack.push('Cypress');
            } catch (error) {
                // Ignore parsing errors
            }
        }

        // Extensions de fichiers
        const extensions = structure.allFiles.map(f => f.split('.').pop().toLowerCase());
        if (extensions.some(ext => ext === 'ts' || ext === 'tsx')) stack.push('TypeScript');
        if (extensions.some(ext => ext === 'jsx')) stack.push('JSX');
        if (extensions.some(ext => ext === 'css' || ext === 'scss')) stack.push('CSS/SCSS');

        return [...new Set(stack)]; // Supprime les doublons
    }

    // -----------------------------------------------------------------------
    // Méthodes utilitaires d'analyse de patterns
    // -----------------------------------------------------------------------
    analyzeFilePatterns(files) {
        const patterns = {
            extensions: {},
            naming: {},
            organization: {}
        };

        files.forEach(file => {
            const ext = path.extname(file.name);
            patterns.extensions[ext] = (patterns.extensions[ext] || 0) + 1;
            
            // Détecte le style de nommage
            if (file.name.includes('.')) {
                const baseName = file.name.split('.')[0];
                if (baseName.includes('-')) {
                    patterns.naming.kebab = (patterns.naming.kebab || 0) + 1;
                } else if (baseName.includes('_')) {
                    patterns.naming.snake = (patterns.naming.snake || 0) + 1;
                } else if (baseName.match(/[A-Z]/)) {
                    patterns.naming.pascal = (patterns.naming.pascal || 0) + 1;
                } else {
                    patterns.naming.camel = (patterns.naming.camel || 0) + 1;
                }
            }
        });

        return patterns;
    }

    // -----------------------------------------------------------------------
    // Heuristiques de domaine spécifiques (Next.js / React / Backend / Mobile)
    // -----------------------------------------------------------------------
    analyzeNextJSDomain(structure) {
        // Next.js: app router vs pages router
        if (structure.directories['app']) {
            return 'Modern Web Application (App Router)';
        } else if (structure.directories['pages']) {
            return 'Web Application (Pages Router)';
        }
        return 'Web Application';
    }

    analyzeReactDomain(structure) {
        // React: présence de src/components
        if (structure.directories['src'] && structure.directories['src'].some(f => f.name.includes('components'))) {
            return 'Component-Based Web Application';
        }
        return 'React Application';
    }

    analyzeBackendDomain(structure) {
        // Backend: détection de controllers/routes
        if (structure.directories['controllers'] && structure.directories['routes']) {
            return 'REST API Backend';
        } else if (structure.directories['src'] && structure.directories['src'].some(f => f.name.includes('api'))) {
            return 'API Backend';
        }
        return 'Backend Service';
    }

    analyzeMobileDomain(structure) {
        // Mobile: dossiers android/ios
        if (structure.directories['android'] || structure.directories['ios']) {
            return 'Native Mobile Application';
        }
        return 'Cross-Platform Mobile Application';
    }

    // -----------------------------------------------------------------------
    // Heuristiques complémentaires basées sur noms/description/README/structure
    // -----------------------------------------------------------------------
    analyzeProjectName(name, currentDomain) {
        const nameLower = name.toLowerCase();
        
        // Indices courants dans les noms de projet
        if (nameLower.includes('api') || nameLower.includes('backend')) return 'Backend API';
        if (nameLower.includes('web') || nameLower.includes('frontend')) return 'Web Application';
        if (nameLower.includes('mobile') || nameLower.includes('app')) return 'Mobile Application';
        if (nameLower.includes('ecommerce') || nameLower.includes('shop')) return 'E-commerce Application';
        if (nameLower.includes('blog') || nameLower.includes('cms')) return 'Content Management System';
        if (nameLower.includes('dashboard') || nameLower.includes('admin')) return 'Admin Dashboard';
        
        return currentDomain || 'Web Application';
    }

    analyzeDescription(description, currentDomain) {
        const descLower = description.toLowerCase();
        
        // Indices dans la description du projet
        if (descLower.includes('api') || descLower.includes('backend')) return 'Backend API';
        if (descLower.includes('web app') || descLower.includes('frontend')) return 'Web Application';
        if (descLower.includes('mobile') || descLower.includes('react native')) return 'Mobile Application';
        if (descLower.includes('ecommerce') || descLower.includes('shopping')) return 'E-commerce Application';
        if (descLower.includes('blog') || descLower.includes('cms')) return 'Content Management System';
        
        return currentDomain || 'Web Application';
    }

    analyzeREADME(content) {
        const contentLower = content.toLowerCase();
        
        // Extrait le domaine probable depuis le README
        if (contentLower.includes('api') || contentLower.includes('endpoint')) return 'Backend API';
        if (contentLower.includes('web app') || contentLower.includes('frontend')) return 'Web Application';
        if (contentLower.includes('mobile') || contentLower.includes('react native')) return 'Mobile Application';
        if (contentLower.includes('ecommerce') || contentLower.includes('shop')) return 'E-commerce Application';
        
        return null;
    }

    analyzeStructureForDomain(structure) {
        // Indices structurels de domaine
        if (structure.directories['controllers'] && structure.directories['models']) {
            return 'Backend API';
        } else if (structure.directories['components'] && structure.directories['pages']) {
            return 'Web Application';
        } else if (structure.directories['screens'] && structure.directories['navigation']) {
            return 'Mobile Application';
        }
        
        return null;
    }

    mergeDomainAnalysis(primary, secondary) {
        if (primary && secondary && primary !== secondary) {
            // Priorise le plus spécifique si divergence
            if (primary.includes('API') && secondary.includes('Web')) return primary;
            if (secondary.includes('API') && primary.includes('Web')) return secondary;
            return primary; // Par défaut
        }
        return primary || secondary;
    }

    // -----------------------------------------------------------------------
    // analyzeComplexity(structure)
    // -----------------------------------------------------------------------
    // But: alternative (non utilisée ici) pour calculer une complexité plus fine
    // en fonction de divers patterns collectés dans structure.
    // -----------------------------------------------------------------------
    analyzeComplexity(structure) {
        let complexity = 0;
        
        // Compte des dossiers
        complexity += Object.keys(structure.directories).length * 2;
        
        // Compte des fichiers
        const totalFiles = Object.keys(structure.files).length;
        complexity += totalFiles * 0.5;
        
        // Analyse des patterns
        Object.values(structure.patterns).forEach(pattern => {
            complexity += Object.keys(pattern.extensions).length;
        });
        
        if (complexity < 10) return 'Simple';
        if (complexity < 20) return 'Moderate';
        if (complexity < 30) return 'Complex';
        return 'Very Complex';
    }

    // -----------------------------------------------------------------------
    // analyzeTargetAudience(structure, domain)
    // -----------------------------------------------------------------------
    // But: inférer une audience cible en fonction du domaine déduit.
    // -----------------------------------------------------------------------
    analyzeTargetAudience(structure, domain) {
        // Quelques règles simples basées sur le domaine
        if (domain && domain.includes('API')) return 'Developers';
        if (domain && domain.includes('Admin')) return 'Administrators';
        if (domain && domain.includes('E-commerce')) return 'Consumers';
        if (domain && domain.includes('Mobile')) return 'Mobile Users';
        
        return 'General Users';
    }

    // -----------------------------------------------------------------------
    // calculatePurposeConfidence(structure, purpose)
    // -----------------------------------------------------------------------
    // But: calculer une confiance sur la finalité à partir de la richesse des
    // informations disponibles (package.json, README, structure...).
    // -----------------------------------------------------------------------
    calculatePurposeConfidence(structure, purpose) {
        let confidence = 0;
        
        // package.json
        if (structure.files['package.json']) confidence += 0.4;
        
        // README
        if (structure.files['README.md']) confidence += 0.3;
        
        // Structure (présence de dossiers)
        if (Object.keys(structure.directories).length > 0) confidence += 0.2;
        
        // Noms/Types présents
        if (purpose.domain && purpose.type) confidence += 0.1;
        
        return Math.min(1, confidence);
    }

    // -----------------------------------------------------------------------
    // analyzeLayerSeparation(structure)
    // -----------------------------------------------------------------------
    // But: détecter des couches logiques (Presentation, Business, Data, Utils,
    // Config, Middleware) à partir des noms de dossiers.
    // -----------------------------------------------------------------------
    analyzeLayerSeparation(structure) {
        const layers = [];
        const dirs = structure.allDirectories.map(d => d.toLowerCase());

        // Couche présentation
        if (dirs.some(d => d.includes('components') || d.includes('pages') || d.includes('views'))) {
            layers.push('Presentation');
        }

        // Couche logique métier
        if (dirs.some(d => d.includes('services') || d.includes('business') || d.includes('logic'))) {
            layers.push('Business Logic');
        }

        // Couche accès aux données
        if (dirs.some(d => d.includes('models') || d.includes('repositories') || d.includes('dao'))) {
            layers.push('Data Access');
        }

        // Couche utilitaires
        if (dirs.some(d => d.includes('utils') || d.includes('helpers') || d.includes('common'))) {
            layers.push('Utilities');
        }

        // Couche configuration
        if (dirs.some(d => d.includes('config') || d.includes('settings'))) {
            layers.push('Configuration');
        }

        // Couche middleware
        if (dirs.some(d => d.includes('middleware') || d.includes('interceptors'))) {
            layers.push('Middleware');
        }

        return layers.length > 0 ? layers : ['Monolithic'];
    }

    // -----------------------------------------------------------------------
    // detectDesignPatterns(structure)
    // -----------------------------------------------------------------------
    // But: détecter quelques design patterns fréquemment observables par
    // inspection de noms de dossiers/fichiers.
    // -----------------------------------------------------------------------
    detectDesignPatterns(structure) {
        const patterns = [];
        const dirs = structure.allDirectories.map(d => d.toLowerCase());
        const files = structure.allFiles.map(f => f.toLowerCase());

        // Check for Singleton pattern (configuration files)
        if (files.some(f => f.includes('config') && f.includes('.js'))) {
            patterns.push('Singleton (Configuration)');
        }

        // Check for Factory pattern (service creation)
        if (dirs.some(d => d.includes('factory')) || files.some(f => f.includes('factory'))) {
            patterns.push('Factory');
        }

        // Check for Repository pattern (data access)
        if (dirs.some(d => d.includes('repository')) || files.some(f => f.includes('repository'))) {
            patterns.push('Repository');
        }

        // Check for Observer pattern (event handling)
        if (files.some(f => f.includes('event') || f.includes('observer') || f.includes('listener'))) {
            patterns.push('Observer');
        }

        // Check for Middleware pattern
        if (dirs.some(d => d.includes('middleware')) || files.some(f => f.includes('middleware'))) {
            patterns.push('Middleware');
        }

        // Check for MVC pattern
        if (dirs.some(d => d.includes('models')) && dirs.some(d => d.includes('controllers'))) {
            patterns.push('MVC');
        }

        // Check for Service pattern
        if (dirs.some(d => d.includes('services'))) {
            patterns.push('Service Layer');
        }

        // Check for Component pattern (React/UI)
        if (dirs.some(d => d.includes('components'))) {
            patterns.push('Component');
        }

        return patterns;
    }

    // -----------------------------------------------------------------------
    // analyzeArchitecturalQuality(structure, architecture)
    // -----------------------------------------------------------------------
    // But: produire un score qualitatif et des listes forces/faiblesses basées
    // sur la séparation des couches, les patterns, l'organisation, la config,
    // la documentation et la structure de tests.
    // -----------------------------------------------------------------------
    analyzeArchitecturalQuality(structure, architecture) {
        let score = 5;
        const strengths = [];
        const weaknesses = [];

        // Check for proper separation of concerns
        if (architecture.layers.length >= 3) {
            score += 2;
            strengths.push('Good separation of concerns');
        } else {
            weaknesses.push('Limited layer separation');
        }

        // Check for design patterns usage
        if (architecture.patterns.length >= 2) {
            score += 2;
            strengths.push('Good use of design patterns');
        } else {
            weaknesses.push('Limited use of design patterns');
        }

        // Check for directory organization
        const organizedDirs = structure.allDirectories.filter(dir => 
            dir.includes('components') || dir.includes('services') || 
            dir.includes('utils') || dir.includes('config')
        );
        if (organizedDirs.length >= 3) {
            score += 1;
            strengths.push('Well-organized directory structure');
        } else {
            weaknesses.push('Basic directory organization');
        }

        // Check for configuration management
        const configFiles = structure.allFiles.filter(file => 
            file.includes('config') || file.includes('env') || file.includes('settings')
        );
        if (configFiles.length >= 2) {
            score += 1;
            strengths.push('Proper configuration management');
        } else {
            weaknesses.push('Limited configuration management');
        }

        // Check for documentation
        const docFiles = structure.allFiles.filter(file => 
            file.includes('readme') || file.includes('docs') || file.includes('api')
        );
        if (docFiles.length >= 1) {
            score += 1;
            strengths.push('Documentation present');
        } else {
            weaknesses.push('Missing documentation');
        }

        // Check for testing structure
        const testFiles = structure.allFiles.filter(file => 
            file.includes('test') || file.includes('spec') || file.includes('jest')
        );
        if (testFiles.length >= 1) {
            score += 1;
            strengths.push('Testing structure present');
        } else {
            weaknesses.push('No testing structure found');
        }

        return {
            score: Math.min(10, Math.max(0, score)),
            strengths,
            weaknesses
        };
    }

    // -----------------------------------------------------------------------
    // generateSpecificRecommendations(structure, purpose, architecture, coherence, quality)
    // -----------------------------------------------------------------------
    // But: générer une liste de recommandations concrètes (docs, tests, sécurité,
    // configuration) selon les faiblesses identifiées dans les analyses.
    // -----------------------------------------------------------------------
    generateSpecificRecommendations(structure, purpose, architecture, coherence, quality) {
        const recommendations = [];
        
        // Purpose-based recommendations
        if (purpose.confidence < 0.5) {
            recommendations.push({
                type: 'purpose',
                title: 'Improve Project Documentation',
                message: 'Add clear project description, purpose, and usage instructions in README.md',
                priority: 'high',
                category: 'documentation'
            });
        }

        if (!purpose.description) {
            recommendations.push({
                type: 'purpose',
                title: 'Add Project Description',
                message: 'Include a clear description in package.json and README.md',
                priority: 'medium',
                category: 'documentation'
            });
        }
        
        // Architecture-based recommendations
        if (architecture.quality < 7) {
            recommendations.push({
                type: 'architecture',
                title: 'Improve Architecture',
                message: `Consider implementing ${architecture.pattern} with better separation of concerns`,
                priority: 'medium',
                category: 'structure'
            });
        }

        if (architecture.layers.length < 3) {
            recommendations.push({
                type: 'architecture',
                title: 'Add Layer Separation',
                message: 'Implement proper separation between presentation, business logic, and data layers',
                priority: 'medium',
                category: 'structure'
            });
        }
        
        // Coherence-based recommendations
        if (coherence.consistency < 7) {
            recommendations.push({
                type: 'coherence',
                title: 'Standardize Code Patterns',
                message: 'Establish and follow consistent naming conventions and file organization',
                priority: 'medium',
                category: 'consistency'
            });
        }

        if (coherence.naming < 7) {
            recommendations.push({
                type: 'coherence',
                title: 'Improve Naming Consistency',
                message: 'Use consistent naming conventions across files and directories',
                priority: 'low',
                category: 'consistency'
            });
        }
        
        // Quality-based recommendations
        if (quality.overall < 7) {
            recommendations.push({
                type: 'quality',
                title: 'Enhance Code Quality',
                message: 'Focus on improving maintainability, readability, and testing coverage',
                priority: 'high',
                category: 'quality'
            });
        }

        if (quality.maintainability < 7) {
            recommendations.push({
                type: 'quality',
                title: 'Improve Maintainability',
                message: 'Add more modular structure and separation of concerns',
                priority: 'medium',
                category: 'quality'
            });
        }

        if (quality.testability < 7) {
            recommendations.push({
                type: 'quality',
                title: 'Add Testing',
                message: 'Implement unit tests and integration tests for better code reliability',
                priority: 'medium',
                category: 'testing'
            });
        }

        if (quality.security < 7) {
            recommendations.push({
                type: 'quality',
                title: 'Enhance Security',
                message: 'Add security middleware and authentication mechanisms',
                priority: 'high',
                category: 'security'
            });
        }

        // Structure-based recommendations
        const docFiles = structure.allFiles.filter(f => f.includes('readme') || f.includes('docs'));
        if (docFiles.length === 0) {
            recommendations.push({
                type: 'structure',
                title: 'Add Documentation',
                message: 'Create README.md with project description, setup instructions, and API documentation',
                priority: 'high',
                category: 'documentation'
            });
        }

        const testFiles = structure.allFiles.filter(f => f.includes('test') || f.includes('spec'));
        if (testFiles.length === 0) {
            recommendations.push({
                type: 'structure',
                title: 'Add Test Files',
                message: 'Create test files and testing infrastructure',
                priority: 'medium',
                category: 'testing'
            });
        }

        const configFiles = structure.allFiles.filter(f => f.includes('config') || f.includes('env'));
        if (configFiles.length < 2) {
            recommendations.push({
                type: 'structure',
                title: 'Improve Configuration',
                message: 'Add proper configuration files and environment management',
                priority: 'medium',
                category: 'configuration'
            });
        }

        // Technology-specific recommendations
        if (structure.files['package.json']) {
            try {
                const pkg = JSON.parse(structure.files['package.json']);
                const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                
                if (deps['express'] && !deps['helmet']) {
                    recommendations.push({
                        type: 'technology',
                        title: 'Add Security Middleware',
                        message: 'Consider adding helmet.js for enhanced security headers',
                        priority: 'medium',
                        category: 'security'
                    });
                }

                if (deps['express'] && !deps['express-rate-limit']) {
                    recommendations.push({
                        type: 'technology',
                        title: 'Add Rate Limiting',
                        message: 'Consider adding express-rate-limit for API protection',
                        priority: 'low',
                        category: 'security'
                    });
                }

                if (!deps['jest'] && !deps['mocha']) {
                    recommendations.push({
                        type: 'technology',
                        title: 'Add Testing Framework',
                        message: 'Consider adding Jest or Mocha for unit testing',
                        priority: 'medium',
                        category: 'testing'
                    });
                }
            } catch (error) {
                // Ignore parsing errors
            }
        }
        
        return recommendations;
    }

    // -----------------------------------------------------------------------
    // Appels API GitHub
    // -----------------------------------------------------------------------
    // fetchDirectoryContents: liste les éléments d'un répertoire d'un repo
    // fetchFileContent: récupère le contenu base64 d'un fichier et le décode
    // 
    // Important:
    // - Utilise l'API GitHub `contents` avec un header Authorization (token)
    // - Les réponses renvoient du contenu encodé en base64 (pour les fichiers)
    // -----------------------------------------------------------------------
    async fetchDirectoryContents(owner, repo, path) {
        try {
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`,
                },
            });
            return response.data;
        } catch (error) {
            // Propagation de l'erreur vers l'appelant (gérée plus haut)
            throw error;
        }
    }

    async fetchFileContent(owner, repo, filePath) {
        try {
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`,
                },
            });
            // Décodage du contenu base64 en UTF-8
            return Buffer.from(response.data.content, 'base64').toString('utf8');
        } catch (error) {
            // Propagation de l'erreur vers l'appelant (gérée plus haut)
            throw error;
        }
    }
}

// Export de la classe pour usage dans d'autres modules (ex: routes/controllers)
module.exports = IntelligentProjectAnalyzer; 