import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";
import { getBrandOptions, getCategoryOptions } from "@/lib/admin-options";
import { deleteProduct } from "@/app/admin/actions";
import { parseImages, parseVariants } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { name: true } });
  return { title: product ? `Редакция: ${product.name}` : "Продуктът не е намерен" };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    getCategoryOptions(),
    getBrandOptions(),
  ]);

  if (!product) notFound();

  return (
    <>
      <Link
        href="/admin/produkti"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Обратно към продуктите
      </Link>

      <PageHeader
        title="Редакция на продукт"
        description={product.name}
        action={
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
            >
              <Trash2 className="size-4" aria-hidden />
              Изтрий
            </button>
          </form>
        }
      />

      <ProductForm
        categories={categories}
        brands={brands}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          shortDescription: product.shortDescription,
          description: product.description,
          price: product.price,
          oldPrice: product.oldPrice,
          stock: product.stock,
          trackStock: product.trackStock,
          unit: product.unit,
          weight: product.weight,
          images: parseImages(product.images),
          variants: parseVariants(product.variants),
          categoryId: product.categoryId,
          brandId: product.brandId,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          isNew: product.isNew,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
        }}
      />
    </>
  );
}
