import express from 'express';

const router = express.Router();

// Simple template routes without database dependencies for testing
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Templates endpoint is working!',
    data: [],
    mockData: [
      {
        id: '1',
        title: 'Sample Quiz Template',
        description: 'This is a test quiz template',
        isPublic: true,
        isQuiz: true,
        createdAt: new Date().toISOString(),
        author: { id: '1', name: 'Test User' },
        topic: { id: '1', name: 'Education' },
        tags: [{ id: '1', name: 'quiz' }, { id: '2', name: 'education' }],
        likesCount: 5,
        commentsCount: 2
      },
      {
        id: '2',
        title: 'Sample Survey Template',
        description: 'This is a test survey template',
        isPublic: true,
        isQuiz: false,
        createdAt: new Date().toISOString(),
        author: { id: '2', name: 'Another User' },
        topic: { id: '2', name: 'Business' },
        tags: [{ id: '3', name: 'survey' }, { id: '4', name: 'business' }],
        likesCount: 8,
        commentsCount: 4
      }
    ],
    timestamp: new Date().toISOString(),
    total: 2,
    page: 1,
    limit: 10
  });
});

router.get('/search', (req, res) => {
  const { q } = req.query;
  res.status(200).json({
    message: 'Template search is working!',
    query: q || '',
    results: [],
    timestamp: new Date().toISOString()
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.status(200).json({
    message: 'Template details endpoint is working!',
    templateId: id,
    data: {
      id: id,
      title: 'Sample Template Details',
      description: 'This is a detailed view of a test template',
      isPublic: true,
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: '1',
          question: 'What is your name?',
          type: 'text',
          required: true
        },
        {
          id: '2',
          question: 'How old are you?',
          type: 'number',
          required: false
        }
      ]
    },
    timestamp: new Date().toISOString()
  });
});

// POST, PUT, DELETE routes require authentication (will add error handling)
router.post('/', (req, res) => {
  res.status(401).json({
    message: 'Authentication required',
    error: 'Please login to create templates',
    timestamp: new Date().toISOString()
  });
});

router.put('/:id', (req, res) => {
  res.status(401).json({
    message: 'Authentication required',
    error: 'Please login to update templates',
    timestamp: new Date().toISOString()
  });
});

router.delete('/:id', (req, res) => {
  res.status(401).json({
    message: 'Authentication required',
    error: 'Please login to delete templates',
    timestamp: new Date().toISOString()
  });
});

export default router;
