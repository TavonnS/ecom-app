const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    // find all tags and include associated Product data
    const tags = await Tag.findAll({
      include: Product,
    });

    res.status(200).json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    // find a single tag by its `id` and include associated Product data
    const tag = await Tag.findByPk(req.params.id, {
      include: Product,
    });

    if (!tag) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }

    res.status(200).json(tag);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    // create a new tag
    const newTag = await Tag.create(req.body);

    res.status(201).json(newTag);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});


router.put('/:id', async (req, res) => {

  try {

    const updatedTag = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
      returning: true,
    })
    res.status(200).json(updatedTag);

    // or add a message here

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Bad Request', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // delete one tag by its `id` value
    const rowsDeleted = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (rowsDeleted === 0) {
      res.status(404).json({ message: 'Tag not found' });
      return;
    }

    res.status(200).json({ message: 'Category deleted successfully' });
    
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;
