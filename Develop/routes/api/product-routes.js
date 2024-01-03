const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    // find all products and include associated Category and Tag data
    const products = await Product.findAll({
      include: [
        {
          model: Category,
        },
        {
          model: Tag,
          through: ProductTag,
        },
      ],
    });

    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    // find a single product by its `id` and include associated Category and Tag data
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
        },
        {
          model: Tag,
          through: ProductTag,
        },
      ],
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    // create a new product
    const product = await Product.create(req.body);

    // if there are product tags, create pairings to bulk create in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// update product
router.put('/:id', async (req, res) => {
  try {
    // update product data
    const [rowsUpdated, [updatedProduct]] = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
      returning: true, // return the updated record
    });

    if (rowsUpdated === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // update product tags
    if (req.body.tagIds && req.body.tagIds.length) {
      const productTags = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });

      const currentTagIds = productTags.map(({ tag_id }) => tag_id);

      const newTagIds = req.body.tagIds.filter((tag_id) => !currentTagIds.includes(tag_id));

      const removedTagIds = currentTagIds.filter((tag_id) => !req.body.tagIds.includes(tag_id));

      await Promise.all([
        ProductTag.destroy({ where: { id: removedTagIds } }),
        ProductTag.bulkCreate(newTagIds.map((tag_id) => ({ product_id: req.params.id, tag_id }))),
      ]);
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

// delete one product by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const rowsDeleted = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (rowsDeleted === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

module.exports = router;

