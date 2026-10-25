export interface StudySample {
  title: string;
  category: string;
  text: string;
}

export const SAMPLE_STUDY_NOTES: StudySample[] = [
  {
    title: 'Biologia Celular',
    category: 'Biologia',
    text: `Mitocôndria: Organelo responsável pela respiração celular aeróbia e produção de ATP (adenosina trifosfato).
Cloroplasto: Estrutura celular presente em plantas e algas onde ocorre a fotossíntese através da clorofila.
Ribossomo: Complexo macromolecular responsável pela tradução do RNA mensageiro em cadeias de aminoácidos (proteínas).
Complexo de Golgi: Modifica, empacota e distribui proteínas e lípidos sintetizados no retículo endoplasmático.
Retículo Endoplasmático Rugoso: Rede de túbulos com ribossomos associados envolvida na síntese de proteínas de exportação.
Lisossomo: Vesícula com enzimas digestivas ácidas encarregada da autofagia e digestão celular.
Membrana Plasmática: Bicamada lipídica com permeabilidade seletiva que delimita a célula e controla as trocas com o exterior.
Núcleo Celular: Contém a maior parte do material genético (DNA) organizado em cromossomas e comanda as funções celulares.`,
  },
  {
    title: 'Ciência da Computação & Web',
    category: 'Tecnologia',
    text: `DOM (Document Object Model): Interface de programação independente de linguagem que representa documentos HTML e XML como nós e objetos navegáveis.
Closure (Fecho em JS): Combinação de uma função com as referências ao estado circundante (ambiente léxico) onde foi criada.
Event Loop: Mecanismo assíncrono em JavaScript que monitoriza a pilha de chamadas (Call Stack) e processa mensagens da fila (Task Queue).
API REST: Estilo arquitetural para sistemas hipermédia que utiliza operações HTTP padrão (GET, POST, PUT, DELETE) e comunicação stateless.
Complexidade O(1): Tempo de execução constante, independente do número de elementos na entrada de dados.
Transição CSS: Propriedade que permite alterar suavemente valores de estilo ao longo de uma duração definida sem recorrer a JavaScript.`,
  },
  {
    title: 'Filosofia Antiga',
    category: 'Filosofia',
    text: `Método Socrático: Técnica de investigação baseada no diálogo e questionamento sucessivo para estimular o pensamento crítico e revelar contradições.
Mito da Caverna: Alegoria platónica sobre a ilusão do mundo sensível e a libertação do indivíduo através do conhecimento das Ideias.
Eudaimonia: Conceito aristotélico de felicidade duradoura alcançada através da prática da virtude e realização do potencial humano.
Ataraxia: Estado de tranquilidade e serenidade da alma, livre de perturbações e medos desnecessários, preconizado pelo Epicurismo e Estoicismo.`,
  },
  {
    title: 'História Moderna & Contemporânea',
    category: 'História',
    text: `Revolução Industrial: Transição para novos processos de manufatura no século XVIII iniciada na Grã-Bretanha, caracterizada pelo vapor e mecanização.
Iluminismo: Movimento intelectual e filosófico europeu do século XVIII centrado na razão, liberdade individual e método científico.
Tratado de Versalhes: Acordo de paz assinado em 1919 que encerrou oficialmente a Primeira Guerra Mundial entre a Alemanha e as potências aliadas.
Guerra Fria: Período de tensão geopolítica entre os Estados Unidos e a União Soviética e os seus respetivos aliados (1947–1991).`,
  },
];
