const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const returnRegex = /  return \(\n    <div className="min-h-dvh h-dvh sm:min-h-screen sm:h-auto[\s\S]*/;

const newReturn = `  return (
    <div className="min-h-dvh flex flex-col bg-[#FAFAF7] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white selection:bg-[#F2B90C] selection:text-[#0A0A0A] transition-colors duration-300">
      <MainHeader 
        onMenuClick={() => setShowLmsModal(true)} 
        currentUser={currentUser} 
        theme={theme}
        onToggleTheme={setTheme}
      />
      
      {isOffline && (
        <div className="w-full bg-[#F2B90C] text-[#0A0A0A] text-center text-xs font-bold py-1.5 flex items-center justify-center gap-1.5 border-b border-black/10">
          <WifiOff className="w-3.5 h-3.5" />
          Offline Mode Active — Using cached MCQs
        </div>
      )}

      <main className="flex-1 w-full max-w-3xl mx-auto flex flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden">
        <div className="w-full max-w-[560px] mx-auto relative flex flex-col flex-1">
          {screen !== 'intro' && screen !== 'admin' && (
            <div className="mb-4">
              <StepTrail currentStep={getStepNumber()} totalSteps={4} />
            </div>
          )}

          <div className="flex-1 flex flex-col justify-between min-h-0 w-full relative">
            {screen === 'intro' && (
              <IntroScreen
                onContinue={() => setScreen('grades_flow')}
                onSelectGradesFlow={() => setScreen('grades_flow')}
                onOpenCommunity={() => setShowCommunityModal(true)}
                onOpenHistory={() => setShowHistoryModal(true)}
                onOpenLmsPortal={() => setShowLmsModal(true)}
                historyCount={history.length}
                theme={theme}
                onToggleTheme={(newTheme) => setTheme(newTheme)}
              />
            )}
            {screen === 'grades_flow' && (
              <GradesFlowScreen onSelectClass={handleSelectClass} />
            )}
            {screen === 'group' && (
              <ClassGroupScreen selectedClass={selectedClass!} onSelectGroup={handleSelectGroup} onBack={() => setScreen('grades_flow')} />
            )}
            {screen === 'auth' && (
              <LmsAuthScreen onSuccess={() => setScreen(nextScreenAfterAuth)} selectedGradeContext={selectedClass?.toString()} />
            )}
            {screen === 'dashboard' && (
              <ClassStreamDashboard
                classNumber={selectedClass!}
                group={selectedGroup!}
                studentProfile={studentProfile}
                onTakeTest={(subjectId) => {
                  setSelectedSubject(subjectId);
                  setScreen('duration');
                }}
                onBack={() => setScreen('group')}
                onReviewHistory={() => setShowHistoryModal(true)}
                onLogout={async () => {
                  await supabase.auth.signOut();
                  setStudentProfile(null);
                  setScreen('group');
                }}
                theme={theme}
              />
            )}
            {screen === 'subject' && (
              <SubjectScreen 
                onSelectSubject={(subject) => {
                  setSelectedSubject(subject);
                  setScreen('duration');
                }}
                onBack={() => setScreen('group')}
              />
            )}
            {screen === 'duration' && (
              <DurationScreen 
                onSelectConfig={(config) => {
                  setTestConfig(config);
                  setScreen('test');
                }}
                onBack={() => setScreen('dashboard')}
                subject={selectedSubject!}
              />
            )}
            {screen === 'test' && (
              <TestScreen
                config={testConfig!}
                subject={selectedSubject!}
                onComplete={handleTestComplete}
                onExit={() => setScreen('dashboard')}
              />
            )}
            {screen === 'results' && testResult && (
              <ResultsScreen
                result={testResult}
                onPlayAgain={() => {
                  setTestResult(null);
                  setScreen('dashboard');
                }}
                onShare={() => setShowPrintableModal(true)}
              />
            )}
            {screen === 'admin' && (
              <AdminDashboardScreen onBack={() => setScreen('intro')} />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showPrintableModal && testResult && (
        <PrintableTestModal result={testResult} onClose={() => setShowPrintableModal(false)} />
      )}
      {showCommunityModal && (
        <CommunityModal onClose={() => setShowCommunityModal(false)} />
      )}
      {showHistoryModal && (
        <HistoryModal 
          history={history} 
          onClose={() => setShowHistoryModal(false)} 
          onLoadResult={(result) => {
            setTestResult(result);
            setScreen('results');
            setShowHistoryModal(false);
          }}
        />
      )}
      {showLmsModal && (
        <LmsPortalModal onClose={() => setShowLmsModal(false)} />
      )}
    </div>
  );
};
`;

code = code.replace(returnRegex, newReturn);
fs.writeFileSync('src/App.tsx', code);
