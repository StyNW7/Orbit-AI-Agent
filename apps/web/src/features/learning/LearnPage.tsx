import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { FileUp, GraduationCap, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/layout-blocks';
import { ROLE_BY_ID } from '@/data/catalog';
import { curriculumFor } from '@/data/courses';
import { useOrbit } from '@/store/orbit';
import { useUi } from '@/store/ui';
import { useGuide } from '@/store/guide';
import { useT } from '@/lib/i18n';
import { ease } from '@/lib/motion';
import { VaultView } from './VaultView';
import { LearningMapView } from './LearningPage';

type View = 'vault' | 'map';

/** Learn hub: what you study (Knowledge Vault) and what each class is for (Learning Map). */
export default function LearnPage() {
  const profile = useOrbit((s) => s.profile)!;
  const materials = useOrbit((s) => s.materials.length);
  const openAdd = useUi((s) => s.openAddMaterial);
  const mark = useGuide((s) => s.mark);
  const [params, setParams] = useSearchParams();
  const { t, l } = useT();
  const view: View = params.get('view') === 'map' ? 'map' : 'vault';
  const course = params.get('course') ?? undefined;
  const classes = curriculumFor(profile.major).length;

  useEffect(() => {
    if (view === 'map') mark('learning');
  }, [mark, view]);

  const setView = (v: View) => setParams(v === 'vault' ? {} : { view: v }, { replace: true });

  return (
    <div className="space-y-6">
      <PageHeader
        stage={t('Learn', 'Belajar')}
        eyebrow="Knowledge Vault · Learning Map"
        title={t('Everything you learn, pointed at {role}', 'Semua yang kamu pelajari, terarah ke {role}', { role: l(ROLE_BY_ID[profile.targetRole].name) })}
        description={t(
          'Your Knowledge Vault holds what you study. The Learning Map shows what each class is for. Both feed your Journey with the best next thing to learn.',
          'Knowledge Vault menyimpan apa yang kamu pelajari. Learning Map menunjukkan kegunaan setiap mata kuliah. Keduanya memberi Journey-mu hal terbaik untuk dipelajari berikutnya.',
        )}
        actions={
          <Button onClick={() => openAdd()}>
            <FileUp /> {t('Add material', 'Tambah materi')}
          </Button>
        }
      />
      <Segmented
        label={t('Learn views', 'Tampilan belajar')}
        value={view}
        onChange={setView}
        className="max-w-full"
        options={[
          { value: 'vault', label: 'Knowledge Vault', icon: Library, count: materials },
          { value: 'map', label: 'Learning Map', icon: GraduationCap, count: classes },
        ]}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25, ease }}>
          {view === 'vault' ? <VaultView /> : <LearningMapView key={`${profile.targetRole}-${course ?? ''}`} initialCourse={course} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
