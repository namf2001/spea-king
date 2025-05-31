import { VocabularyDashboard } from './vocabulary-dashboard';

export async function VocabularyClinet({ exercises }: { exercises: any[] }) {
    return <VocabularyDashboard exercises={exercises} />;
}